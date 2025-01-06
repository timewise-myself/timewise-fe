"use client";
import React from "react";
import Image from "next/image";
import { CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

const Info = () => {
  const { data: session } = useSession();
  return (
    <>
      <div className="flex items-center gap-x-4 hover:cursor-pointer">
        <div className="w-[40px] h-[40px] relative">
          <Image
            fill
            src={session?.user?.image || "/images/icons/google.svg"}
            alt={"logo"}
            className="rounded-md object-cover hover:cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-xl">{session?.user.name}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3 mr-1" />
          </div>
        </div>
      </div>
    </>
  );
};

Info.Skeleton = function SkeletonInfo() {
  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[60px] h-[60px] relative">
        <Skeleton className="w-full h-full absolute" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-[200px]" />
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </div>
  );
};

export default Info;
