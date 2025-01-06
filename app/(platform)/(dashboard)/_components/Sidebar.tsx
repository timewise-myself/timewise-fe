/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Accordion } from "@radix-ui/react-accordion";
import { useLocalStorage } from "usehooks-ts";
import NavItem from "./NavItem";
import CreateWorkspaceDialogCompact from "./CreateWorkspaceDialogCompact";
import { CalendarRange, ChevronsUpDown, Store, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Workspace } from "@/types/Board";
import { useLinkedEmailsForManage } from "@/hooks/useLinkedEmailForManage";
import { useSession } from "next-auth/react";
import { useStateContext } from "@/stores/StateContext";
import { Listbox } from "@headlessui/react";

interface Props {
  storageKey?: string;
}

const Sidebar = ({ storageKey = "t-sidebar-state" }: Props) => {
  const { data: session } = useSession();
  const {
    setStateWorkspacesByEmail,
    setStateSelectedEmail,
    setStateFilteredWorkspaces,
  } = useStateContext();
  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  );
  const [selectedEmail, setSelectedEmail] = useState<string>("all");
  const { linkedEmails, isLoading: isEmailsLoading } =
    useLinkedEmailsForManage("linked");

  const fetchWorkspaces = async (email: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/get-workspaces-by-email/${email}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.user.access_token}`,
        },
      }
    );
    const data = await response.json();
    return data.map((workspace: Workspace) => workspace);
  };

  const { data: workspacesByEmail, isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces", linkedEmails],
    queryFn: async () => {
      if (!linkedEmails) return {};
      const workspacesByEmail: Record<string, Workspace[]> = {};
      await Promise.all(
          linkedEmails.map(async (email: string) => {
            workspacesByEmail[email] = await fetchWorkspaces(email);
          })
      );
      return workspacesByEmail;
    },
    enabled: !!session && !!linkedEmails,
  });

  useEffect(() => {
    if (workspacesByEmail) {
      setStateWorkspacesByEmail(workspacesByEmail);
    }
  }, [workspacesByEmail, setStateWorkspacesByEmail]);

  const filteredWorkspaces = useMemo(() => {
    return selectedEmail === "all"
      ? Object.values(workspacesByEmail || {}).flat()
      : workspacesByEmail?.[selectedEmail] || [];
  }, [selectedEmail, workspacesByEmail]);

  const handleSelectEmail = async (email: string) => {
    setSelectedEmail(email);

    if (email === "all") {
      const allWorkspacesByEmail: Record<string, Workspace[]> = {};
      await Promise.all(
          (linkedEmails || []).map(async (linkedEmail: string) => {
            allWorkspacesByEmail[linkedEmail] = await fetchWorkspaces(linkedEmail);
          })
      );
      setStateWorkspacesByEmail(allWorkspacesByEmail);
    } else {
      const emailWorkspaces = await fetchWorkspaces(email);
      setStateWorkspacesByEmail({ [email]: emailWorkspaces });
    }
  };

  useEffect(() => {
    const filteredWorkspaces =
        selectedEmail === "all"
            ? Object.values(workspacesByEmail || {}).flat()
            : workspacesByEmail?.[selectedEmail] || [];
    setStateFilteredWorkspaces(filteredWorkspaces);
  }, [selectedEmail, workspacesByEmail, setStateFilteredWorkspaces]);

  const groupedWorkspaces = useMemo(() => {
    return selectedEmail === "all"
      ? workspacesByEmail || {}
      : { [selectedEmail]: workspacesByEmail?.[selectedEmail] || [] };
  }, [selectedEmail, workspacesByEmail]);

  const onExpand = (id: string) => {
    setExpanded((curr) => ({
      ...curr,
      [id]: !expanded[id],
    }));
  };

  if (isEmailsLoading || isWorkspacesLoading) {
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-10 w-[50%]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <NavItem.Skeleton />
          <NavItem.Skeleton />
          <NavItem.Skeleton />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col pt-4 pb-8 px-4">
      {/* Dropdown cho Linked Emails */}
      <div className="w-56 mb-5 h-10">
        <Listbox value={selectedEmail} onChange={handleSelectEmail}>
          <Listbox.Button className="border border-gray-300 h-12 px-3 py-2 w-full text-left rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
            {selectedEmail === "all" ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Users width={24} height={24} className="rounded-full" />
                  <span className="font-medium">All Emails</span>
                </div>
                <ChevronsUpDown className="w-2.5 h-2.5" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  width={24}
                  height={24}
                  src="/images/icons/google.svg"
                  alt="Avatar"
                  className="rounded-full"
                />
                <div className="flex flex-col w-[148px]">
                  <span className="font-medium truncate">
                    {selectedEmail.split("@")[0]}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {selectedEmail}
                  </span>
                </div>
                <ChevronsUpDown className="w-8 h-8" />
              </div>
            )}
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-2 w-70 bg-white border border-gray-300 rounded-md shadow-lg max-h-65 overflow-auto">
            <Listbox.Option
              value="all"
              className="cursor-pointer p-3 hover:bg-gray-100 flex items-center gap-3 h-12"
            >
              <Users width={24} height={24} className="rounded-full" />
              <span className="font-medium">All Emails</span>
            </Listbox.Option>
            {linkedEmails?.map((email: string) => (
              <Listbox.Option
                key={email}
                value={email}
                className="cursor-pointer p-3 hover:bg-gray-100 flex items-center gap-3 h-12"
              >
                <Image
                  width={24}
                  height={24}
                  src="/images/icons/google.svg"
                  alt="Avatar"
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-medium truncate">
                    {email.split("@")[0]}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {email}
                  </span>
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>

      <Separator className="my-3 w-full" />
      <Link href={"/organization/calender"}>
        <div className="font-medium text-xs flex mb-1 hover:cursor-pointer w-full rounded-xl h-6">
          <span className="flex items-center align-middle gap-1 font-semibold text-sm">
            <CalendarRange className="w-4 h-4" />
            <span>Calendar</span>
          </span>
        </div>
      </Link>
      <Separator className="my-3 w-full" />
      <div className="flex justify-between w-full mb-1.5">
        <span className="flex gap-1 items-center font-semibold text-sm">
          <Store className="w-4 h-4" /> Workspaces
        </span>
        <CreateWorkspaceDialogCompact />
      </div>
      {/* Workspaces Accordion */}
      <div className="flex flex-col justify-center">
        {Object.entries(groupedWorkspaces).map(([email, workspaces]) => (
          <div key={email} className="mb-4">
            <h3 className="text-sm font-thin italic mb-1 text-gray-500">
              {email}
            </h3>
            <Accordion
              type="multiple"
              defaultValue={Object.keys(expanded).filter(
                (key) => expanded[key]
              )}
              className="space-y-2"
            >
              {workspaces.map((workspace: Workspace, index: number) => (
                <NavItem
                  key={index}
                  workspace={workspace}
                  onExpand={onExpand}
                  isActive={expanded[workspace.ID]}
                  isExpanded={false}
                />
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
