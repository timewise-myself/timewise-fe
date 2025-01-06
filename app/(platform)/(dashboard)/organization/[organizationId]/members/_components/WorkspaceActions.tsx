"use client";
import React, {useState} from "react";
import {useSession} from "next-auth/react";
import {useParams} from "next/navigation";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {deleteWorkspace, fetchWorkspaceDetails, getCurrentWorkspaceUserInfo, removeMember} from "@/lib/fetcher";
import {useStateContext} from "@/stores/StateContext";
import {Workspace} from "@/types/Board";

const WorkspaceActions = () => {
    const {data: session} = useSession();
    const params = useParams();
    const organizationId = params.organizationId;
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalAction, setModalAction] = useState("");

    const {data: workspaceInfo, isLoadingWorkspace} = useQuery<Workspace>({
        queryKey: ["workspaceDetails", organizationId],
        queryFn: async () => {
            return await fetchWorkspaceDetails(organizationId as string, session);
        },
        enabled: !!organizationId && !!session
    });

    const {data: currentUserInfo, isLoading: isLoadingUserInfo} = useQuery({
        queryKey: ["currentUserInfo", organizationId],
        queryFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }

            return await getCurrentWorkspaceUserInfo({
                organizationId: organizationId,
                userEmail: userEmail.email
            }, session);
        },
        enabled: !!organizationId && !!session && stateUserEmails.length > 0,
    });

    const mutationRemoveMember = useMutation({
        mutationFn: async (workspaceUserId) => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(organizationId));
            if (!userEmail) {
                return null;
            }
            return removeMember({organizationId, workspaceUserId, userEmail: userEmail.email}, session);
        },
        onSuccess: () => window.location.href = "/organization/calender",
    });

    const mutationDeleteWorkspace = useMutation({
        mutationFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }
            return deleteWorkspace(organizationId.toString(), userEmail.email, session);
        },
        onSuccess: () => window.location.href = "/organization/calender",
    });

    const openModal = (action, data) => {
        setModalAction(action);
        setModalData(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
        setModalAction("");
    };

    const handleConfirm = () => {
        if (modalAction === "leaveWorkspace" && modalData) {
            mutationRemoveMember.mutate(modalData.wspUserId);
        } else if (modalAction === "deleteWorkspace") {
            mutationDeleteWorkspace.mutate();
        }
        closeModal();
    };

    if (!currentUserInfo && isLoadingUserInfo && isLoadingWorkspace && !workspaceInfo) {
        return <div>Loading...</div>;
    }

    const isPersonalWsp = workspaceInfo?.type === "personal";

    const isAllowedLeave = !isPersonalWsp && currentUserInfo?.role !== "owner";

    return (
        <div className="workspace-actions p-6 pt-0">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-red-600 text-lg font-semibold">Actions</h2>
            </div>
            <div className="border-2 border-red-500 rounded-xl">
                <table className="w-full">
                    <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="p-4 flex justify-between">
                            <div className="flex-8">
                                <p className="font-semibold">Leave Workspace</p>
                                <p className="text-gray-600 italic">
                                    {isPersonalWsp
                                        ? 'You can not leave your personal workspace.'
                                        : currentUserInfo?.role === "owner"
                                            ? 'Owners cannot leave the workspace without transferring ownership.'
                                            : 'Once leaved, you need to be invited again to join the workspace. Please be careful.'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => openModal("leaveWorkspace", {wspUserId: currentUserInfo?.ID})}
                                className={` text-white p-2 h-8 flex items-center justify-center font-semibold text-xs rounded  w-32 
                                ${!isAllowedLeave ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"}`}
                                disabled={!isAllowedLeave}
                            >
                                Leave Workspace
                            </button>
                        </td>
                    </tr>
                    {currentUserInfo?.role === "owner" && (
                        <tr>
                            <td className="p-4 flex justify-between">
                                <div className="flex-8">
                                    <p className="font-semibold">Delete Workspace</p>
                                    <p className="text-gray-600 italic">
                                        {isPersonalWsp
                                            ? 'You can not leave your personal workspace.'
                                            : 'Once deleted, it will be gone forever. Please be certain.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => openModal("deleteWorkspace", {organizationId})}
                                    className={` text-white p-2 h-8 flex items-center justify-center font-semibold text-xs rounded  w-32 
                                ${isPersonalWsp ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"}`}
                                    disabled={isPersonalWsp}
                                >
                                    Delete Workspace
                                </button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-lg font-semibold mb-4">
                            {modalAction === "leaveWorkspace" && "Are you sure you want to leave this workspace?"}
                            {modalAction === "deleteWorkspace" && "Are you sure you want to delete this workspace?"}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
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

export default WorkspaceActions;