import React from "react";

const WorkspaceCalenderLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full h-full bg-gray-100 px-[-10px]">{children}</div>;
};

export default WorkspaceCalenderLayout;
