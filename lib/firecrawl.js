import Firecrawl from "@mendable/firecrawl-js";

if (!process.env.FIRECRAWL_API_KEY) {
  console.error("FIRECRAWL_API_KEY is not set in environment variables");
}

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});


export async function scrapeProduct(url) {
    try {
        const result=await firecrawl.scrape(url,{
            formats: [{type:'json',"schema": {
                "type": "object",
                "required": [
                    "productName",
                    "currentPrice"
                ],
                "properties": {
                    "productName": {
                        "type": "string"
                      },
                    "currentPrice": {
                        "type": "string"
                    },
                    "currencyCode": {
                        "type": "string"
                    },
                    "productImageUrl": {
                        "type": "string"
                    }
                }
            },
            "prompt": "extract the name as \"productName\" current price as a number as 'currentPrice\" currency code (USD,EUR,INR) as 'currencyCode' and product image URL as 'productImageUrl' if available"}],
        });
        const extractedData=result.json;

        if(!extractedData || !extractedData.productName || !extractedData.currentPrice){
            throw new Error('Failed to extract product data');
        }

        return extractedData;

            
    } catch (error) {
        console.error('Firecrawl error scrape error:', error);
        throw new Error(' Failed to scrape product: ' + error.message);
    }
}