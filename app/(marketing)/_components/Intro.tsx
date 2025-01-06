"use client";
import React from "react";

const Intro = () => {
  return (
    <div className="relative w-full h-screen bg-[url('/images/banner/4.png')] bg-cover bg-center bg-fixed">
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h1 className="font-extrabold text-5xl">
            Transform Your Workday Efficiency
          </h1>
          <p className="text-xl text-center font-bold mt-3 leading-10 max-w-[600px] mx-auto">
            Discover a suite of tools designed to enhance your productivity,
            streamline your tasks, and synchronize your team&apos;s efforts
            seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
