import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Price Check endpoint is working .use Post to trigger.",
  });
}

export async function POST(request)
{
try {
    const authHeader=request.headers.get('authorization');
    const cronSecret=process.env.CRON_SECRET;

    if(!cronSecret || authHeader!==`Bearer ${cronSecret}`){
        return NextResponse.json({error:'Unauthorized'}, {status:401});
    }


    //use service role to bypass RLS
    const superbase=createClient(
        process.env.SUPERBASE_SERVICE_ROLE_KEY,
        process.env.NEXT_PUBLIC_SUPERBASE_URL
    );
    
    const {data:products,error:productsError}=(await superbase).from("products").select("*");

    if(productsError) throw productsError;

    console.log(`Found ${products.length} products to check prices for.`);

    const results={
        total:products.length,
        updated:0,
        failed:0,
        priceChanges:0,
        alertsSent:0,
    };

    for (const product of products){
        try {
            const productData=await scrapeProduct(product.url);

            if(!productData || !productData.currentPrice){
                results.failed++;
                continue;
            }

            const newPrice=parseFloat (productData.currentPrice);
                const oldPrice=parseFloat (product.current_price);

                (await superbase).from("products").update({
                    current_price:newPrice,
                    currency:productData.currencyCode || product.currency,
                    name:productData.productName || product.name,
                    image_url:productData.productImageUrl || product.image_url,
                    updated_at:new Date().toISOString(),
                }).eq("id", product.id);
    
                if(oldPrice!==newPrice)
                {
                    await superbase.from("price_history").insert({
                        product_id:product.id,
                        price:newPrice,
                        currency:productData.currencyCode || product.currency,
                        checked_at:new Date().toISOString(),
                    });
                    results.priceChanges++;
                }
    
                if (newPrice <oldPrice)
                {
                    //only possible with superbase service role key
    
                    const {data:{user},}=await authHeader.admin.getUserById(product.user_id);
    
                    if(user?.email)
                    {
                      //send Email
                      const emailResult=await sendPriceDropAlert(
                        user.email,
                        product,
                        oldPrice,
                        newPrice
                      )

                      if(emailResult.success){
                        results.alertsSent++;
                      }
                    }
                }
                results.updated++;
        } catch (error) {
            console.error(`Error Processing product ${product.id}:`,error);
            results.failed++;
        }
    }

    return NextResponse.json(results);
} catch (error) {
    console.error('Error in price check cron:', error);
    return NextResponse.json({error: error.message}, {status: 500});
}
}
