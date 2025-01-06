import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  hasText?: boolean;
}

const Logo = ({ hasText }: LogoProps) => {
  let logoSrc = "/images/icons/timewise-logo.svg";
  let width = 45;
  let height = 45;
  if (hasText) {
    logoSrc = "/images/icons/timewise-logo-text.svg";
    width = 200;
    height = 45;
  }
  return (
    <Link href="/organization/calender">
      <div className="hover:opacity-75 transition-none items-center gap-x-2 hidden md:flex ">
        <Image
          src={logoSrc}
          alt="logo"
          width={width}
          height={height}
          quality={100}
          className="cursor-pointer"
        />
      </div>
    </Link>
  );
};

export default Logo;
