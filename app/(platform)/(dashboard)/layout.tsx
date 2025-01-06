import React from "react";
import Navbar from "./_components/Navbar";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-screen">
            <nav className="shadow-md">
                <Navbar />
            </nav>
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    );
};

export default DashBoardLayout;
