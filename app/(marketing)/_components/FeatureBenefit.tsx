"use client";
import { FEATURE_BENEFITS } from "@/constants/faq";
import React from "react";

const FeatureBenefit = () => {
  return (
    <section className=" text-gray-700 body-font border-t border-gray-200 mt-2">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h2 className="mb-12 text-xl font-bold leading-none text-center sm:text-3xl text-sky-500">
            All Features
          </h2>
          <h3>Overview of Timewuse as an AI-powered schedule platform</h3>
        </div>
        <div className="flex flex-wrap -m-4">
          {FEATURE_BENEFITS.map((feature, index) => (
            <div key={index} className="p-4 md:w-1/4 sm:w-1/2 w-full">
              {" "}
              <div className="border border-gray-200 p-6 rounded-lg  bg-sky-100 cursor-pointer">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-xl text-gray-900 font-medium title-font mb-2">
                  {feature.title}
                </h2>
                <p className="leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureBenefit;
