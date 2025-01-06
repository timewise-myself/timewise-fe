import React from "react";

interface Props {
  children: React.ReactNode;
}

const CalenderLayout = ({ children }: Props) => {
  return <div className="w-full h-full bg-gray-100">{children}</div>;
};

export default CalenderLayout;
