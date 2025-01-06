import { ModalProvider } from "@/components/provider/modal-provider";
import { QueryProvider } from "@/components/provider/querry-provider";
import React from "react";
import { Toaster } from "sonner";
interface Props {
  children: React.ReactNode;
}

const PlatformLayout = ({ children }: Props) => {
  return (
    <div className="w-full h-full">
      <QueryProvider>
        <Toaster />
        <ModalProvider />
        {children}
      </QueryProvider>
    </div>
  );
};

export default PlatformLayout;
