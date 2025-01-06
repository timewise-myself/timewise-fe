"use client";
import { dataFaqs } from "@/constants/faq";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCollapse } from "react-collapsed";

interface Props {
  isActive: boolean;
  children: React.ReactNode;
}

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="dark:bg-sky-200 dark:text-gray-800 py-10 ">
      <h1 className=" text-6xl font-bold text-shadow-xl p-2 text-center">
        Frequently Asked Questions
      </h1>

      <div className="max-w-[1000px] container flex lg:flex-row flex-col justify-center p-4 mx-auto md:p-8">
        <div className="flex flex-col divide-y sm:px-8 lg:px-12 xl:px-32 dark:divide-gray-300">
          {dataFaqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                className="flex items-center justify-between py-2 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <span>
                  {openIndex === index ? (
                    <Image
                      src="/images/arrow-up.svg"
                      alt="arrow-down"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Image
                      src="/images/arrow-down.svg"
                      alt="arrow-down"
                      width={24}
                      height={24}
                    />
                  )}
                </span>
              </button>
              <Collapse isActive={openIndex === index}>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </Collapse>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;

const Collapse = ({ isActive, children }: Props) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const { getCollapseProps } = useCollapse({ isExpanded });

  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  return <div {...getCollapseProps()}>{children}</div>;
};
