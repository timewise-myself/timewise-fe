import React from "react";
import Sidebar from "../_components/Sidebar";
import { BOARD_DATA } from "@/test/fake-board-data";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="mx-auto h-full bg-gray-100">
      <div className="flex h-full">
        <div className="w-75 shrink-0 hidden md:block w-[250px] overflow-auto">
          <Sidebar />
        </div>
        <div
          className="flex-1 overflow-auto
          scrollbar-hide no-scrollbar bg-no-repeat bg-cover bg-center group relative h-full w-full"
          style={{ backgroundImage: `url(${BOARD_DATA[1].imageFullUrl})` }}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default OrganizationLayout;
