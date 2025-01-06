/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useParams } from "next/navigation";
import { Member } from "@/types/Board";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
  data: Member[];
  currentUserInfo: { role: string; access_token: string };
}

export const acceptMemberRequest = async (params: any, session: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/verify-invitation`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session?.user.access_token}`,
        "X-User-Email": `${params.userEmail}`,
        "X-Workspace-ID": `${params.organizationId}`,
        "Content-Type": "application/json",
      },
      // truyền schedule id nhưng thực ra là wsp id =)))
      body: JSON.stringify({
        email: params.email,
        schedule_id: parseInt(params.organizationId, 10),
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const declineMemberRequest = async (params: any, session: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/disprove-invitation`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session?.user.access_token}`,
        "X-User-Email": `${params.userEmail}`,
        "X-Workspace-ID": `${params.organizationId}`,
        "Content-Type": "application/json",
      },
      // truyền schedule id nhưng thực ra là wsp id =)))
      body: JSON.stringify({
        email: params.email,
        schedule_id: parseInt(params.organizationId, 10),
      }),
    }
  );

  const data = await response.json();
  return data;
};

const JoinRequest = ({ data, currentUserInfo }: Props) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const params = useParams();
    const { stateWorkspacesByEmail, stateUserEmails } = useStateContext();
  const { mutate: acceptMemberRequestMutation } = useMutation({
    mutationFn: async (email: string) => {
      const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
      if (!userEmail) {
        return null;
      }
      const response = await acceptMemberRequest(
        {
          email,
          organizationId: params.organizationId,
          userEmail: userEmail.email
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Member request accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["listMembers"] });
    },
    onError: () => {
      toast.error("Error when accepting member request");
    },
  });

  const { mutate: declineMemberRequestMutation } = useMutation({
    mutationFn: async (email: string) => {
      const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
      if (!userEmail) {
        return null;
      }
      const response = await declineMemberRequest(
        {
          userEmail: userEmail.email,
          email,
          organizationId: params.organizationId,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Member request declined successfully");
      queryClient.invalidateQueries({ queryKey: ["listMembers"] });
    },
    onError: () => {
      toast.error("Error when declining member request");
    },
  });
  const userRole = currentUserInfo?.role;
  return (
    <div>
      {Array.isArray(data) && data.length > 0 ? (
        data.map((member: Member) => (
          <div
            key={member?.id}
            className="flex flex-row justify-between items-center w-full space-y-2"
          >
            <div className="flex flex-row items-center space-x-2">
              <Image
                src={member?.profile_picture}
                alt="user"
                className="w-6 h-6 rounded-full"
                width={24}
                height={24}
              />
              <div>
                <p className="text-black text-sm font-semibold">
                  {member?.email}
                </p>
                <p className="text-black text-sm font-medium">{member?.role}</p>
              </div>
            </div>
            <div className="flex flex-row space-x-2">
              {userRole === "admin" || userRole === "owner" ? (
                  <>
                    <button
                        onClick={() => acceptMemberRequestMutation(member?.email)}
                        className="bg-green-500 text-white px-4 py-1 rounded-md"
                    >
                      Accept
                    </button>
                    <button
                        onClick={() => declineMemberRequestMutation(member?.email)}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                    >
                      Decline
                    </button>
                  </>
              ) : (
                  <p className="text-sm text-gray-500">
                    {member?.status === "joined"
                        ? "Awaiting Admin/Owner Approval"
                        : member?.status}
                  </p>
              )}
            </div>
          </div>
        ))
      ) : (
          <p className="w-full flex items-center justify-center text-black text-md font-bold ">
            No Join Request
          </p>
      )}
    </div>
  );
};

export default JoinRequest;
