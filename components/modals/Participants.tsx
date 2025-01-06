/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { checkSchedulePermission, ScheduleAction } from "@/constants/roles";
import FormInvite from "@components/form/form-invite";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { Separator } from "@components/ui/separator";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  AssigneeSchedules, fetchWorkspaceDetails,
  removeParticipantFromSchedule,
  UnassignSchedule,
} from "@/lib/fetcher";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";
import workspaceInfo
  from "@/app/(platform)/(dashboard)/organization/[organizationId]/members/_components/WorkspaceInfo";
import {Workspace} from "@/types/Board";

interface ParticipantsProps {
  scheduleData: any;
  participantsData: any;
}

interface AssignToScheduleParams {
  email: string;
  userEmail: string | undefined;
  scheduleId: string;
  workspaceId: string;
  session: any;
}

const Participants = ({
  scheduleData,
  participantsData,
}: ParticipantsProps) => {
  const [localParticipantsData, setLocalParticipantsData] =
    useState<any>(participantsData);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  useEffect(() => {
    // Update the participants data
    setLocalParticipantsData(participantsData);
  }, [participantsData]);

  const getInvitationStatusClass = (invitation_status: string) => {
    switch (invitation_status) {
      case "joined":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspaceDetails", scheduleData.workspace_id],
    queryFn: () =>
        fetchWorkspaceDetails(scheduleData.workspace_id as string, session),
    enabled: !!scheduleData.workspace_id,
  });

  const { mutate } = useMutation({
    mutationFn: async ({
      participantId,
      userEmail,
      organizationId,
      scheduleId,
      session,
    }: {
      participantId: string;
      userEmail: string | undefined;
      organizationId: string;
      scheduleId: string;
      session: any;
    }) => {
      return await removeParticipantFromSchedule(
        { participantId, userEmail, organizationId, scheduleId },
        session
      );
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleParticipant"],
      });
      // setLocalParticipantsData(localParticipantsData.filter(participant => participant.id !== participantId));
      toast.success("Participant removed successfully");
    },
    onError: (err) => {
      toast.error("Failed to remove participant");
    },
  });

  const { mutate: assignToSchedule } = useMutation({
    mutationFn: async ({
      email,
      userEmail,
      scheduleId,
      workspaceId,
      session,
    }: AssignToScheduleParams) => {
      return await AssigneeSchedules(
        {
          email: email,
          schedule_id: scheduleId,
          organizationId: workspaceId,
          userEmail: userEmail,
        },
        session
      );
    },
    onSuccess: () => {
      toast.success("Member assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["scheduleParticipant"],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign member");
    },
  });

  const { mutate: unassignSchedule } = useMutation({
    mutationFn: async ({
      participantId,
      userEmail,
      organizationId,
      scheduleId,
      session,
    }: {
      participantId: string;
      userEmail: string | undefined;
      organizationId: string;
      scheduleId: string;
      session: any;
    }) => {
      return await UnassignSchedule(
        { participantId, userEmail, organizationId, scheduleId },
        session
      );
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleParticipant"],
      });
      // setLocalParticipantsData(localParticipantsData.filter(participant => participant.id !== participantId));
      toast.success("Participant unassigned successfully");
    },
    onError: (err) => {
      console.log("err", err);
      toast.error("Failed to unassign participant");
    },
  });

  const handleAssignToSchedule = (email: string) => {
    const userEmail = getUserEmailByWorkspace(
      stateUserEmails,
      stateWorkspacesByEmail,
      Number(scheduleData.workspace_id)
    );
    if (!userEmail) {
      toast.error("Failed to remove participant");
      return;
    }

    assignToSchedule({
      email: email,
      scheduleId: scheduleData.id,
      workspaceId: scheduleData.workspace_id,
      userEmail: userEmail.email,
      session: session,
    });
  };

  const handleUnassignToSchedule = (id: string) => {
    const userEmail = getUserEmailByWorkspace(
      stateUserEmails,
      stateWorkspacesByEmail,
      Number(scheduleData.workspace_id)
    );
    if (!userEmail) {
      toast.error("Failed to remove participant");
      return;
    }

    unassignSchedule({
      participantId: id,
      userEmail: userEmail.email,
      organizationId: scheduleData.workspace_id,
      scheduleId: scheduleData.id,
      session,
    });
  };

  const handleRemoveParticipant = (id: string) => {
    const userEmail = getUserEmailByWorkspace(
      stateUserEmails,
      stateWorkspacesByEmail,
      Number(scheduleData.workspace_id)
    );
    if (!userEmail) {
      toast.error("Failed to remove participant");
      return;
    }
    mutate({
      participantId: id,
      userEmail: userEmail.email,
      organizationId: scheduleData.workspace_id,
      scheduleId: scheduleData.id,
      session: session,
    });
  };

  return (
    <div className="mt-2">
      <div className="flex gap-x-2 text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <p className="w-[100px]">Participants</p>
        </div>

        <div className="flex flex-wrap gap-1 overflow-y-auto">
          {localParticipantsData?.map((participant: any) => (
            // tag: participant
            <TooltipProvider key={participant.id}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <div
                    key={participant.id}
                    className={`flex items-center gap-x-2 cursor-pointer border-1 px-2 py-1 rounded-xl text-sm ${getInvitationStatusClass(
                      participant.invitation_status
                    )}`}
                  >
                    <div className="flex items-center gap-x-2">
                      <Image
                        src={participant.profile_picture}
                        alt={participant.first_name}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                      <p>
                        {participant.first_name} {participant.last_name}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={1}
                  side="top"
                  className="text-xs max-w-[220px] break-words px-3 py-2"
                >
                  <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                      <Image
                        src={participant.profile_picture}
                        alt={participant.first_name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm mb-0">
                          {participant.first_name} {participant.last_name}
                        </p>
                        {participant.status === "creator" && (
                          <p className="text-[10px] mt-[-5px]">
                            Created this schedule
                          </p>
                        )}
                      </div>
                      <div
                        className={`flex items-center rounded-xl py-1 px-1.5 ${getInvitationStatusClass(
                          participant.invitation_status
                        )}`}
                      >
                        <p>{participant.invitation_status}</p>
                      </div>
                    </div>
                    <p className="mt-1">
                      Role in workspace: {participant.role}
                    </p>
                    {participant.status !== "creator" && (
                      <div>
                        {participant.status !== "assign to" ? (
                          <button
                            onClick={() =>
                              handleAssignToSchedule(participant.email)
                            }
                            className="my-1"
                          >
                            Assign this participant
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUnassignToSchedule(participant.id)
                            }
                            className="my-1"
                          >
                            Unassign this participant
                          </button>
                        )}
                        <Separator className="mt-1.5 mb-0" />
                        <button
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }
                          className="mt-2"
                        >
                          Remove from schedule
                        </button>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          { workspace?.type !== "personal" && (
              <FormInvite
                  data={scheduleData}
                  disabled={
                    !checkSchedulePermission(
                        scheduleData.extra_data,
                        ScheduleAction.invite
                    )
                  }
              >
                <div
                    className={
                      "flex items-center gap-x-2 border-2 px-2 py-1 rounded-xl text-sm border-transparent hover:border-gray-400 bg-gray-200 text-gray-400 cursor-pointer h-[28px]"
                    }
                >
                  <UserPlus className="h-4 w-4" />
                  <p>Invite</p>
                </div>
              </FormInvite>
          )}
        </div>
      </div>
    </div>
  );
};

export default Participants;
