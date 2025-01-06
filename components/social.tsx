"use client";
import React from "react";
import { Button } from "./ui/Button";
import Image from "next/image";
import { signIn } from "next-auth/react";

const Social = () => {
  const onClick = async () => {
    try {
      await signIn("google", { redirectTo: "/organization" });
    } catch (error) {
      throw error;
    }
  };
  return (
    <div className="flex items-center gap-x-2 w-full px-6 py-2">
      <Button
        size={"lg"}
        className="w-full"
        variant={"outline"}
        onClick={onClick}
      >
        <Image
          width={24}
          height={24}
          src="/images/icons/google.svg"
          alt="Google Logo"
        />
      </Button>
    </div>
  );
};

export default Social;
