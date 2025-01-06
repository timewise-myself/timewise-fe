/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from "react";
import Image from "next/image";

interface Props {
    children?: React.ReactNode;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    data: any;
    participant: any;
    disabled?: boolean;
}

const Assignee = ({children, participant}: Props) => {
    const assignTo = participant?.filter((p: any) => p.status === "assign to")[0];

    return (
        <div className={`flex flex-row items-center mt-1 text-sm ${assignTo && 'text-sky-600 bg-sky-100 px-2 py-1 rounded-xl'}`}>
            {assignTo ? (
                <>
                    <Image
                        width={20}
                        height={20}
                        className="h-[18px] w-[18px] rounded-full"
                        src={assignTo.profile_picture}
                        alt={assignTo.first_name}
                    />
                    <span className="ml-2">{assignTo.first_name} {assignTo.last_name}</span>
                </>
            ) : (
                <span className="text-gray-400 ml-2">Not assigned yet</span>
            )}
            {children}
        </div>
    );
};

export default Assignee;
