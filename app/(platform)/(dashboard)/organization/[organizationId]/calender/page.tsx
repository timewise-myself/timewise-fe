/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useStateContext } from "@/stores/StateContext";
import { useQuery } from "@tanstack/react-query";
import {fetchWorkspaceDetails, getCurrentWorkspaceUserInfo, getMembersInWorkspace, getSchedules} from "@/lib/fetcher";
import CalendarApp from "@components/view-calender/calender";
import {
  Calendars,
  getWorkspaceData,
  transformScheduleData,
} from "@/utils/calendar/calendarUtils";
import { useParams } from "next/navigation";
import { Workspace } from "@/types/Board";
import AddSchedule from "../_components/add-schedule";
import InviteMember from "@/app/(platform)/(dashboard)/organization/[organizationId]/_components/InviteMember";
import Image from "next/image";
import FilterPopover from "@/app/(platform)/(dashboard)/organization/[organizationId]/_components/filter-popover";
import {getUserEmailByWorkspace} from "@/utils/userUtils";

const getWorkspaceById = (
  stateWorkspacesByEmail: Record<string, Workspace[]>,
  workspaceId: number
): Workspace | undefined => {
  for (const email in stateWorkspacesByEmail) {
    const workspace = stateWorkspacesByEmail[email].find(
      (ws) => ws.ID === workspaceId
    );
    if (workspace) {
      return workspace; // Return the workspace as soon as it's found
    }
  }
  return undefined; // Return undefined if not found
};

const WorkspaceCalender = () => {
  const { data: session } = useSession();
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const [workspaceData, setWorkspaceData] = useState<Calendars>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();

  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspaceDetails", params.organizationId],
    queryFn: () =>
        fetchWorkspaceDetails(params.organizationId as string, session),
    enabled: !!params.organizationId,
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

  const openDialog = () => setIsDialogOpen(true);
  //openDialog();
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {});
  };

  // const handleCheckedWorkspacesChange = (checkedWorkspaces: string[]) => {
  //   setCheckedWorkspaces(checkedWorkspaces);
  // };

  const { data, isLoading } = useQuery({
    queryKey: ["schedules", params.organizationId],
    queryFn: async () => {
      const currentWorkspace = getWorkspaceById(
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!currentWorkspace) {
        return [];
      }

      const payload = {
        checkedWorkspaces: [currentWorkspace.ID],
        startTime: "0001-10-01 00:00:00.000",
        endTime: "9999-12-31 23:59:59.000",
        isDeleted: false,
      };
      const response = await getSchedules(payload, session);
      return response || [];
    },
    enabled: !!session && !!stateWorkspacesByEmail,
  });

  const boardId = data?.map((schedule: any) => schedule.board_column_id);
  const firstBoardId = boardId ? boardId[0] : null;

  useEffect(() => {
    const transformedWorkspaceData = getWorkspaceData(stateWorkspacesByEmail);
    setWorkspaceData(transformedWorkspaceData);
  }, [stateWorkspacesByEmail]);

  useEffect(() => {
    if (!isLoading && data) {
      setScheduleData(transformScheduleData(data));
    }
  }, [isLoading, data]);

  return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="flex flex-row items-center px-1 w-full bg-gray-100 justify-between">
          <div className="flex items-center">
            <p className="font-bold">{workspace?.title}</p>
            <div className="ml-4 mt-0.5">
              <AddSchedule
                  listId={firstBoardId}
                  isEditing={isEditing}
                  enableEditing={enableEditing}
                  disableEditing={disableEditing}
                  isGlobalCalendar={true}
                  boardId={firstBoardId}
                  closeDialog={closeDialog}
                  openDialog={openDialog}
              />
            </div>
          </div>
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
          </div>
        </div>
        {stateWorkspacesByEmail && (
            <div className="w-full max-w-[100vw] h-full flex gap-1">
              <CalendarApp
                  scheduleData={scheduleData}
                  workspaceData={workspaceData}
              />
            </div>
        )}
      </div>
  );
};

export default WorkspaceCalender;
