// components/FeatureComparison.tsx
import Image from "next/image";
import React from "react";

interface Feature {
  feature: string;
  hasJira: boolean;
  hasTimeWise: boolean;
}

const features: Feature[] = [
  { feature: "Kanban Boards", hasJira: true, hasTimeWise: true },
  { feature: "Custom Task Statuses", hasJira: false, hasTimeWise: true },
  { feature: "Add Calendar", hasJira: true, hasTimeWise: true },
  { feature: "Create Workspace", hasJira: true, hasTimeWise: true },
  { feature: "Add Schedule", hasJira: true, hasTimeWise: true },
  { feature: "Drag and Drop", hasJira: true, hasTimeWise: true },
  {
    feature: "AI-Powered Text Summarization",
    hasJira: false,
    hasTimeWise: true,
  },
  { feature: "User-Friendly Interface", hasJira: true, hasTimeWise: true },
];

const FeatureComparison = () => {
  return (
    <div className="overflow-x-auto w-full max-w-[1200px] p-2  space-y-2 ">
      <h1 className=" text-6xl font-bold text-shadow-xl p-2 text-center">
        Why choose TimeWise?
      </h1>
      <h2 className=" text-xl  font-bold text-center p-2">
        See why TimeWise flexible, user-friendly Kanban boards are the top
        customization and control.
      </h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xl font-bold text-black uppercase tracking-wider">
              Compare Feature
            </th>
            <th className="px-6 py-3 text-center text-xl font-bold text-black uppercase tracking-wider flex flex-row items-center gap-x-2 justify-center mt-3">
              <p className="text-blue-600">Others</p>
            </th>
            <th className="pl-[150px] text-xl font-bold text-black uppercase tracking-wider text-center">
              <Image
                alt="logo"
                loading="lazy"
                width={200}
                height={200}
                sizes="16px"
                className="cursor-pointer"
                src="/images/icons/timewise-logo-text.svg"
              />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 text-xl">
          {features.map((feature, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                {feature.feature}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xl text-black ">
                <div className="bg-red-50 w-full flex justify-center p-4">
                  {feature.hasJira ? "✅" : "❌"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xl text-black">
                <div className="bg-green-50 w-full flex justify-center p-4">
                  {feature.hasTimeWise ? "✅" : "❌"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureComparison;
