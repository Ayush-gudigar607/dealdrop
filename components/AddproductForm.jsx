"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AddproductForm = ({ user }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
  }

  return (
    <>
    <form  onSubmit={handleSubmit}  className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste product URL (Amazon, Walmart, etc.)"
          className="h-12 text-base"
          required
          disabled={loading}
        />

        <Button 
          type="submit" 
          className="h-12 w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
          disabled={loading}
          size={"lg"}
        >
            {loading ? (
                <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Adding...
                </>
            ) : (
                "Track price"
            )}
        </Button>
      </div>
    </form>
    </>
  );
};

export default AddproductForm;
