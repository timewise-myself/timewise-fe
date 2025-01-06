import React from "react";
import Footer from "./_components/Footer";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full bg-slate-100 ">
      <main className="py-18 bg-slate-100">{children}</main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
