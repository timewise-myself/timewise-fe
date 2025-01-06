import React from "react";
import Image from "next/image";
interface Props {
  children: React.ReactNode;
}

const AuthenticationLayout = ({ children }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-row">
      <div className="flex-2">
        <Image
          width={500}
          height={500}
          src="/images/banner.webp"
          className="lg:block hidden w-full h-full flex-1 object-contain"
          alt="banner"
        />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default AuthenticationLayout;
