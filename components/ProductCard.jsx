"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { deleteProduct } from "@/app/action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChartBar, ChevronUp, ExternalLink, Trash2, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import PriceChart from "./../components/PriceChart";


const ProductCard = ({ product }) => {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    setDeleting(true);

    //call delete action
    const result = await deleteProduct(product.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product deleted successfully");
      setUrl("");
    }
  };

  return (
    <div>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={"pb-3"}>
            <div className="flex gap-4">
                {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-md border"/>

                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-orange-500">
                         {product.currency} {product.current_price}
                       </span>

                       <Badge variant="secondary" className="gap-1">
                        <TrendingDown className="w-3 h-3"/>
                        Tracking
                       </Badge>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
         <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={()=>setShowChart(!showChart)} className="gap-1">
                {showChart ? (
                    <>
                    <ChevronUp className="w-4 h-4"/>
                    Hide Chart
                    </>
                ) : (
                    <>
                    <ChartBar className="w-4 h-4"/>
                    Show Chart
                    </>
                )}
            </Button>
            <Button 
                variant="outline" size="sm" asChild className="gap-1">
                    <Link href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4"/>
                    Visit Site
                    </Link>
                </Button>

                <Button 
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500  hove:text-red-700 hover:bg-red-100 gap-1">

                    <Trash2 className="w-4 h-4"/>
                    Remove
                </Button>
         </div>
        </CardContent>
      {showChart && (
          <CardFooter className="pt-0">
         <PriceChart productId={product.id}/>
        </CardFooter>
      )}
      </Card>
    </div>
  );
};

export default ProductCard;
