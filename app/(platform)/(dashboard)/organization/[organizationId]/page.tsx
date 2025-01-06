/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import ListContainer from "../../board/[boardId]/_components/ListContainer";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {useParams, useSearchParams} from "next/navigation";
import {
  fetchWorkspaceDetails,
  getBoardColumns,
  getCurrentWorkspaceUserInfo,
  getMembersInWorkspace,
} from "@/lib/fetcher";
import InviteMember from "./_components/InviteMember";
import FilterPopover from "./_components/filter-popover";
import {useEffect, useState} from "react";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import {Workspace} from "@/types/Board";
import {Skeleton} from "@/components/ui/skeleton";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";
import {useCardModal} from "@/hooks/useCardModal";
import {useRouter} from "next/navigation";
// import {useRouter} from "next/router";

const OrganizationIdPage = () => {
  const { data: session } = useSession();
  const params = useParams();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isWorkspaceNotFound, setIsWorkspaceNotFound] = useState(false);

  const [due, setDue] = useState<string>("");
  const [dueComplete, setDueComplete] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const [notDue, setNotDue] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 1000);

  const scheduleId = searchParams.get("schedule_id");

  const cardModal = useCardModal();

  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspaceDetails", params.organizationId],
    queryFn: async () => {
      try {
        const data = await fetchWorkspaceDetails(params.organizationId as string, session);
        setIsWorkspaceNotFound(false);
        return data;
      } catch (e) {
        setIsWorkspaceNotFound(true);
        console.error("Workspace not found", e);
        return null;
      }
    },
    enabled: !!params.organizationId && !!session,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "listBoardColumns",
      params.organizationId,
      {
        search: debouncedSearch,
        selectedMembers,
        due,
        dueComplete,
        overdue,
        notDue,
      },
    ],
    queryFn: async () => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }

      const data = await getBoardColumns(
        {
          ...params,
          search: debouncedSearch,
          member: selectedMembers.join(","),
          due,
          dueComplete,
          overdue,
          notDue,
          userEmail: userEmail.email,
        },
        session
      );
      if (Array.isArray(data) && data.length > 0) {
        const maxPosition = data.reduce(
          (max, item) => (item.position > max ? item.position : max),
          1
        );
        queryClient.setQueryData(
          ["maxPosition", params.organizationId],
          maxPosition
        );
      } else {
        queryClient.setQueryData(["maxPosition", params.organizationId], 0);
      }
      return data;
    },
    enabled: !!session && !!workspace,
  });

  const { data: listMembers } = useQuery({
    queryKey: ["listMembers", params.organizationId],
    queryFn: async () => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }
      const data = await getMembersInWorkspace(
        { ...params, userEmail: userEmail.email },
        session
      );
      return data;
    },
    enabled: !!session && !!workspace,
  });

  const {data: currentUserInfo, isLoading: isLoadingUserInfo} = useQuery({
    queryKey: ["currentUserInfo", params.organizationId],
    queryFn: async ({queryKey}) => {
      const [, orgId] = queryKey;
      if (!session?.user?.email || !orgId) return null;

      const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
      if (!userEmail) {
        return null;
      }

      return await getCurrentWorkspaceUserInfo({organizationId: orgId, userEmail: userEmail.email}, session);
    },
    enabled: !!params.organizationId,
  });

  useEffect(() => {
    if (scheduleId && session && Object.keys(stateWorkspacesByEmail).length > 0 && stateUserEmails.length > 0) {
      cardModal.onOpen(scheduleId.toString());

      // remove schedule_id from search params
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.delete("schedule_id");
      router.replace(`?${queryParams.toString()}`);
    }
  }, [scheduleId, session, stateWorkspacesByEmail, stateUserEmails]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        <Skeleton className="h-6 rounded-md w-full" />
        <div className="flex">
          <Skeleton className="mr-4 w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-4 rounded-md w-full" />
            <Skeleton className="h-4 rounded-md w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (isWorkspaceNotFound) {
    return (
        <div className="w-full h-full p-4 space-y-4 bg-gray-100">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-4xl font-semibold">Workspace not found</p>
            <a
                href="/manage-workspaces/all"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 transition"
            >
              Go to Manage Workspaces
            </a>
          </div>
        </div>
    );
  }

  return (
      <div className="w-full mb-5 h-full">
        <div className="relative bg-no-repeat bg-cover bg-center overflow-hidden h-full">
          <main className="relative space-y-1 h-full">
            <div className="flex flex-row items-center px-1 w-full bg-gray-100 justify-between">
              <p className="font-bold">{workspace?.title}</p>
              <div className="flex items-center">
                {workspace?.type !== "personal" && (
                  <div className="flex flex-row p-2 justify-end w-[75%] items-center">
                    <InviteMember members={listMembers} currentUserInfo={currentUserInfo}/>
                    {Array.isArray(listMembers) &&
                        listMembers
                            ?.slice(0, 3)
                            .map((participant: any, index: any) => (
                                <Image
                                    key={index}
                                    src={participant.profile_picture}
                                    alt={"avatar"}
                                    width={20}
                                    height={20}
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ))}
                    {listMembers && listMembers?.length > 3 && (
                        <span
                            className="flex items-center justify-center h-4 w-4 rounded-full bg-black text-xs text-white border-2 border-white">
                    +{listMembers.length - 3}
                  </span>
                    )}
                    <p className="px-2">||</p>
                  </div>
              )}
              <FilterPopover
                  listMembers={listMembers}
                  search={search}
                  setSearch={setSearch}
                  selectedMembers={selectedMembers}
                  setSelectedMember={setSelectedMembers}
                  due={due}
                  setDue={setDue}
                  dueComplete={dueComplete}
                  setDueComplete={setDueComplete}
                  overdue={overdue}
                  setOverdue={setOverdue}
                  notDue={notDue}
                  setNotDue={setNotDue}
                  isPopoverOpen={isPopoverOpen}
                  setIsPopoverOpen={setIsPopoverOpen}
              />
            </div>
          </div>
          <ListContainer
              data={Array.isArray(data) ? data : []}
              boardId={params.organizationId.toString()}
          />
        </main>
      </div>
    </div>
  );
};

export default OrganizationIdPage;
