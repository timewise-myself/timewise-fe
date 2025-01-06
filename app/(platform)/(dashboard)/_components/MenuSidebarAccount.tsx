/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import Info from "../organization/[organizationId]/_components/Info";
import { Skeleton } from "@/components/ui/skeleton";
import {useLinkedEmailsForManage} from "@/hooks/useLinkedEmailForManage";
import {getAccountInformationForSchedule} from "@/lib/fetcher";
import {useQuery} from "@tanstack/react-query";
import {useSession} from "next-auth/react";

const MenuSidebarAccount = () => {
    const { data: session } = useSession();
    const [status, setStatus] = useState<string>("linked");
    const [selectedEmail, setSelectedEmail] = useState<string>("all");
    const { data: accountInfo } = useQuery({
        queryKey: ["accountInformationForSchedule"],
        queryFn: async () => {
            if (!session) return null;
            return await getAccountInformationForSchedule(session);
        },
        enabled: !!session,
    });
    useEffect(() => {
        if (accountInfo?.email?.length > 0) {
            const emailStatus = accountInfo.email[0]?.status || "linked";
            setStatus(emailStatus);
        }
    }, [accountInfo]);
    if (status === "") {
        setStatus("linked");
    }
    const { linkedEmails, isLoading: isEmailsLoading } = useLinkedEmailsForManage(status);
  if (isEmailsLoading) {
    return (
      <>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </>
    );
  }

    const handleEmailClick = (email: string) => {
        setSelectedEmail(email); // Update the selected email
    };

    /*const filteredWorkspaces =
        selectedEmail === "all"
            ? Object.values(workspacesByEmail).flat() // Show all workspaces if "all" is selected
            : workspacesByEmail[selectedEmail] || [];*/

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-transparent hover:bg-white text-black p-0">
          <Info />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Linked Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuItem
                className={`cursor-pointer ${selectedEmail === "all" ? "font-bold" : ""}`}
                onClick={() => handleEmailClick("all")}
            >
                All Workspaces
            </DropdownMenuItem>
            {(Array.isArray(linkedEmails) ? linkedEmails : []).map(
                (email: any, index: number) => (
                    <React.Fragment key={index}>
                        <div
                            className={`flex flex-row gap-x-2 items-center ${
                                selectedEmail === email ? "font-bold" : ""
                            }`}
                            onClick={() => handleEmailClick(email)}
                        >
                            <Image
                                width={24}
                                height={24}
                                src={"/images/icons/google.svg"}
                                alt={"logo"}
                                className="rounded-md object-cover hover:cursor-pointer"
                            />
                            <DropdownMenuItem className="cursor-pointer">{email}</DropdownMenuItem>
                        </div>
                    </React.Fragment>
                )
            )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MenuSidebarAccount;
