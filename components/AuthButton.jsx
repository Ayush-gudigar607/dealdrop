"use client";

import React, { useState } from "react";
import { LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/action";

const AuthButton = ({user}) => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    if(user)
    {
      return (
        <form action={signOut}>
          <Button variant="ghost" size="sm" className=" gap-2" type="submit">
            <LogInIcon className=" w-4 h-4" />
            Sign Out
          </Button>
        </form>
      )
    }
  return (
    <>
      <Button
      onClick={()=>setShowAuthModal(true)}
        variant="default"
        size="sm"
        className=" bg-orange-500 hover:bg-orange-600 gap-2"
      >
        <LogInIcon className=" w-4 h-4" />
        Sign In
      </Button>

      <AuthModal
      isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}

        />
    </>
  );
};

export default AuthButton;
