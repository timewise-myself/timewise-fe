import React from "react";
import Faq from "./_components/Faq";
import Banner from "./_components/Banner";
import Overview from "./_components/Overview";
import Intro from "./_components/Intro";
import Benefit from "./_components/Benefits";
import FeatureComparison from "./_components/compare-features";
import Navbar from "./_components/navbar-menu";

const MarketingPage = () => {
  return (
    <div className="flex items-center justify-center flex-col ">
      <Navbar />
      <Intro />
      <Banner />
      <Overview />
      {/* <FeatureBenefit /> */}
      <FeatureComparison />
      <Benefit />
      <Faq />
    </div>
  );
};

export default MarketingPage;
