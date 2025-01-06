import React from "react";

interface Props {
  children: React.ReactNode;
}

const ManageAccountLayout = ({ children }: Props) => {
  return (
    <div className="w-full h-full flex items-start mx-auto justify-center">
      {children}
    </div>
  );
};

export default ManageAccountLayout;
