import React from "react";
import { cn } from "@/lib/utils";
import { Noto_Serif } from "next/font/google";

interface Props {
  label: string;
}

const font = Noto_Serif({
  subsets: ["latin"],
  weight: "800",
});

const Header = ({ label }: Props) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className={cn("text-3xl font-semibold", font.className)}>
        Welcome To Timewise
      </h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};

export default Header;
