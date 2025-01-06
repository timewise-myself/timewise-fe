"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { signIn } from "next-auth/react";

const Navbar = () => {
  const handleSignIn = async () => {
    await signIn("google", { redirectTo: "/organization/calender" });
  };

  return (
    <div className="fixed py-2 top-0 w-full border-b shadow-sm bg-white flex items-center z-10">
      <div className="px-6 mx-auto flex items-center justify-between w-full">
        <Logo hasText={true} />
        <div className="hidden md:flex items-center space-x-20 m-auto"></div>
        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
          <Button
            onClick={handleSignIn}
            className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 bg-black text-white hover:bg-gray-800 transition-all"
          >
            <img
              src="/images/icons/google.svg"
              alt="Google Logo"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">Continue with Google</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
