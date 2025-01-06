"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  fetchWorkspaceDetails,
  getCurrentWorkspaceUserInfo,
  getMembersInWorkspaceForManage,
  removeMember,
  updateRole,
} from "@/lib/fetcher";
import { Delete } from "lucide-react";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";
import { Skeleton } from "@components/ui/skeleton";
import InviteMember from "@/app/(platform)/(dashboard)/organization/[organizationId]/_components/InviteMember";
import { Workspace } from "@/types/Board";

interface OpenModalParams {
  action: any;
  data: any;
}

const ViewMember = () => {
  const { data: session } = useSession();
  const params = useParams();
  const organizationId = params.organizationId;
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const queryClient = useQueryClient();

  const { data: currentUserInfo, isLoading: isLoadingUserInfo } = useQuery({
    queryKey: ["currentUserInfo", organizationId],
    queryFn: async ({ queryKey }) => {
      const [, orgId] = queryKey;
      if (!session?.user?.email || !orgId) return null;

      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }

      return await getCurrentWorkspaceUserInfo(
        { organizationId: orgId, userEmail: userEmail.email },
        session
      );
    },
    enabled: !!organizationId,
  });

  const {
    data: membersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["listMembers", organizationId],
    queryFn: async () => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }
      return await getMembersInWorkspaceForManage(
        { ...params, userEmail: userEmail.email },
        session
      );
    },
    enabled: !!currentUserInfo?.role,
  });

  const { data: workspaceInfo} = useQuery<Workspace>({
    queryKey: ["workspaceDetails", organizationId],
    queryFn: async () => {
      return await fetchWorkspaceDetails(organizationId as string, session);
    },
    enabled: !!organizationId && !!session,
  });

  useEffect(() => {
    if (!Array.isArray(membersData)) return;

    const userEmail = session?.user?.email?.toLowerCase();

    const filtered = membersData.filter((member) => {
      const isAdminOrOwner =
        currentUserInfo?.role === "admin" || currentUserInfo?.role === "owner";
      const isMember = currentUserInfo?.role === "member";
      const isGuest = currentUserInfo?.role === "guest";

      if (isAdminOrOwner) {
        return true;
      }

      if (isMember) {
        const hasInvited = member.extra_data?.toLowerCase().includes(userEmail);
        return member.status === "joined" || hasInvited;
      }

      if (isGuest) {
        return member.status === "joined";
      }

      return false;
    }).filter((member) => {
      const fullName = `${member?.first_name} ${member?.last_name}`.toLowerCase();
      return (
          fullName.includes(searchTerm.toLowerCase()) ||
          member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const sorted = filtered.sort((a, b) => {
      if (a.is_verify === false && b.is_verify !== false) return -1;
      if (a.is_verify !== false && b.is_verify === false) return 1;

      const fieldA = a[sortBy]?.toLowerCase?.() || "";
      const fieldB = b[sortBy]?.toLowerCase?.() || "";
      type Status = "active" | "invited" | "declined" | "joined";
      if (sortBy === "status") {
        const statusOrder = {
          active: 1,
          invited: 2,
          declined: 3,
          joined: 4,
        };

        const statusA = statusOrder[a.status as Status] || 5;
        const statusB = statusOrder[b.status as Status] || 5;
        if (sortOrder === "asc") {
          return statusA - statusB;
        } else {
          return statusB - statusA;
        }
      }

      if (sortOrder === "asc") {
        return fieldA > fieldB ? 1 : -1;
      }
      return fieldA < fieldB ? 1 : -1;
    });

    setFilteredMembers(sorted);
  }, [searchTerm, sortBy, sortOrder, membersData, session, currentUserInfo]);

  const mutationRoleChange = useMutation({
    mutationFn: async ({
      organizationId,
      email,
      role,
    }: {
      organizationId: any;
      email: any;
      role: any;
    }) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(organizationId)
      );
      if (!userEmail) {
        return null;
      }
      return updateRole(
        { organizationId, email, role, userEmail: userEmail.email },
        session
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listMembers", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserInfo", organizationId],
      });
    },
  });

  const mutationRemoveMember = useMutation({
    mutationFn: async (workspaceUserId) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(organizationId)
      );
      if (!userEmail) {
        return null;
      }
      return removeMember(
        { organizationId, workspaceUserId, userEmail: userEmail.email },
        session
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listMembers", organizationId],
      });
    },
  });

  const [members, setMembers] = React.useState<any[]>([]);

  const handleRoleChange = async (
    organizationId: string | string[],
    email: string,
    role: string
  ) => {
    const currentUser = membersData?.find(
      (member: { email: string | null | undefined }) =>
        member.email === session?.user?.email
    );
    if (
      currentUser?.role === "owner" &&
      role === "owner" &&
      email !== session?.user?.email
    ) {
      await mutationRoleChange.mutateAsync({ organizationId, email, role });
      await mutationRoleChange.mutateAsync({
        organizationId,
        email: session?.user?.email,
        role: "admin",
      });
    } else if (currentUser?.role === "owner") {
      await mutationRoleChange.mutateAsync({ organizationId, email, role });

      if (email === session?.user?.email) {
        await mutationRoleChange.mutateAsync({
          organizationId,
          email: session?.user?.email,
          role: "admin",
        });
      }
    } else {
      await mutationRoleChange.mutateAsync({ organizationId, email, role });
    }
    setMembers((prevMembers: any[]) =>
      prevMembers.map((member) =>
        member.email === email ? { ...member, role: role } : member
      )
    );
    refetch();
  };

  const handleRemoveMember = (memberId: any) => {
    mutationRemoveMember.mutate(memberId);
  };

  const handleLeaveWorkspace = (wspUserId: any) => {
    mutationRemoveMember.mutate(wspUserId);
  };

  const handleModalAction = async () => {
    if (modalAction === "changeRole") {
      const { email, role }: any = modalData;
      await handleRoleChange(organizationId, email, role);
    } else if (modalAction === "removeMember") {
      const { memberId }: any = modalData;
      await handleRemoveMember(memberId);
    } else if (modalAction === "leaveWorkspace") {
      const { wspUserId }: any = modalData;
      await handleLeaveWorkspace(wspUserId);
    }
    setModalOpen(false);
    refetch();
  };

  const openModal = ({action, data}: OpenModalParams) => {
    setModalAction(action);
    setModalData(data);
    setModalOpen(true);
  };

  if (isLoading || isLoadingUserInfo || !workspaceInfo) {
    return (
      <div className="flex items-center gap-x-2">
        <Skeleton className=" h-10 w-full" />
      </div>
    );
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const isPersonalWsp = workspaceInfo?.type === "personal";

  return (
    <div className="workspace-actions p-6 pt-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Workspace Members
        </h2>
        {currentUserInfo?.role !== "guest" && !isPersonalWsp && (
          <InviteMember
            members={membersData}
            currentUserInfo={currentUserInfo}
          />
        )}
      </div>
      {!isPersonalWsp && (
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by Name or Email"
            className="w-full py-1 px-3 border border-gray-300 rounded h-10"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded p-1 h-10"
          >
            <option value="first_name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>

          <button
            onClick={toggleSortOrder}
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
          >
            {sortOrder === "asc" ? "ASC" : "DESC"}
          </button>
        </div>
      )}
      <div className="border-2 border-gray-300 rounded-xl">
        <div className="overflow-auto" style={{ maxHeight: "320px" }}>
          <table className="w-full">
            <tbody>
              {(Array.isArray(filteredMembers) ? filteredMembers : []).map(
                (member) => (
                  <tr key={member.id} className="border-b border-gray-200">
                    <td className="p-4 flex justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={member?.profile_picture || "/default-avatar.png"}
                          alt="user"
                          className="w-10 h-10 rounded-full"
                          width={40}
                          height={40}
                        />
                        <div>
                          <div className="flex gap-2 items-center">
                            <p
                              className="text-sm text-gray-800"
                              style={{ fontSize: "20px" }}
                            >
                              {member?.first_name} {member?.last_name}
                              {member?.email === session?.user?.email &&
                                " (You)"}
                            </p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                  member?.status === "declined" ? "bg-red-100 text-red-700"
                                  : member?.is_verified === false
                                  ? "bg-yellow-100 text-yellow-700"
                                  : member?.status === "removed"
                                  ? "bg-blue-100 text-gray-700"
                                  : member?.is_active
                                  ? "bg-green-100 text-green-700"
                                  : member?.status === "joined"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {member?.status === "declined"
                                ? "Declined"
                                : member?.is_verified === false
                                ? "Awaiting Admin/Owner Approval"
                                : member?.status === "removed"
                                ? "Removed"
                                : member?.is_active
                                ? "Active"
                                : member?.status === "joined"
                                ? "Inactive"
                                : "Invited"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {member?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {currentUserInfo?.role === "admin" ||
                        currentUserInfo?.role === "owner" ? (
                          member.role === "owner" ||
                          member.email === session?.user?.email ? (
                            <div className="flex-1 text-right">
                              <p className="text-sm text-gray-700 font-semibold">
                                {member.role}
                              </p>
                              {member?.extra_data && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {member?.extra_data}
                                </p>
                              )}
                            </div>
                          ) : member.status === "pending" ||
                            !member.is_active ||
                            member.status === "removed" ? (
                            <div className="flex-1 text-right">
                              <p className="text-sm text-gray-700">
                                {member?.role}
                              </p>
                              {member?.extra_data && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {member?.extra_data}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1 text-right">
                              <select
                                value={member?.role}
                                onChange={(e) =>
                                  openModal({action : "changeRole", data : {
                                    email: member.email,
                                    role: e.target.value,
                                  }})
                                }
                                className="border border-gray-300 rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:border-indigo-300 transition-all"
                              >
                                {currentUserInfo?.role === "owner" && member?.is_active && (
                                    <option value="owner">Owner</option>
                                )}
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                {member?.role === "guest" && (
                                    <option value="guest">Guest</option>
                                )}
                              </select>
                              {member?.extra_data && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {member?.extra_data}
                                </p>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="flex-1 text-right">
                            <p className="text-sm text-gray-700">
                              {member?.role}
                            </p>
                            {member?.extra_data && (
                              <p className="text-sm text-gray-500 mt-1">
                                {member?.extra_data}
                              </p>
                            )}
                          </div>
                        )}
                        {(currentUserInfo?.role === "owner" ||
                          currentUserInfo?.role === "admin") &&
                          member?.email !== session?.user?.email &&
                          member?.role !== "owner" && (
                            <button
                              onClick={() =>
                                openModal({action : "removeMember", data : {
                                  memberId: member.id,
                                }})
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Delete size={18} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to{" "}
              {modalAction === "changeRole" && "change the role"}
              {modalAction === "removeMember" && "remove this member"}
              {modalAction === "leaveWorkspace" && "leave this workspace"}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalAction}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMember;
