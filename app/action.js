"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { scrapeProduct } from "@/lib/firecrawl";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function addProduct(formData) {
  const url = formData.get("url");

  if (!url) {
    return { error: "Product URL is required" };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "User not authenticated" };
    }

    //Scrape product data using Firecrawl
    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      console.log("product data:", productData);
      return { error: "Failed to extract product data from the provided URL" };
    }

    const newPrice = parseFloat(productData.currentPrice);
    const currencyCode = productData.currencyCode || "USD";

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id,current_price")
      .eq("url", url)
      .eq("user_id", user.id)
      .single();

    //Product exists → existingProduct is an object → !!existingProduct = true
    const isUpdate = !!existingProduct;

    //upsert product (insert or update based on user_id +url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency: currencyCode,
          image_url: productData.productImageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", //unique constraint on user_id +url
          ignoreDuplicates: false, //Always update if exists
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting product:", error);
      return { error: "Failed to add/update product" };
    }

    //Add to price history if it it's a new product OR price changed
    const shouldAddHistory =
      !isUpdate ||
      (existingProduct && existingProduct.current_price !== newPrice);

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currencyCode,
      });
    }
    revalidatePath("/");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated successfully"
        : "Product added successfully",
    };
  } catch (error) {
    console.error("Error in addProduct action:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) {
      console.error("Error deleting product:", error);
      return { error: "Failed to delete product" };
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "An unexpected error occurred. Please try again.",
      message: error.message,
    };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getPriceHistory(productId) {
    try {
        const supabase=await createClient();
        const {data,error}=await supabase.from("price_history").select("*").eq("product_id",productId).order("checked_at",{ascending:true});
        if(error){
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error('Error fetching price history:',error);
        return [];
    }
}