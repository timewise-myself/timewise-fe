"use client";
import React, {useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useParams} from "next/navigation";
import {fetchWorkspaceDetails, getCurrentWorkspaceUserInfo, updateWorkspace} from "@/lib/fetcher";
import {useSession} from "next-auth/react";
import {Skeleton} from "@components/ui/skeleton";
import {Workspace} from "@/types/Board";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";
import {toast} from "sonner";

const WorkspaceInfo = () => {
    const {data: session} = useSession();
    const params = useParams();
    const organizationId = params.organizationId;
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();
    const queryClient = useQueryClient();

    const {data: workspaceInfo, isLoading} = useQuery<Workspace>({
        queryKey: ["workspaceDetails", organizationId],
        queryFn: async () => {
            const data = await fetchWorkspaceDetails(organizationId as string, session);
            setTitle(data.title);
            setDescription(data.description);
            return data;
        },
        enabled: !!session
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

    const mutation = useMutation({
        mutationFn: async (updatedWorkspace: {
            description: string,
            title: string
        }) => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }

            return await updateWorkspace({
                userEmail: userEmail.email,
                workspaceId: organizationId,
                description: updatedWorkspace.description,
                title: updatedWorkspace.title
            }, session);
        },
        onSuccess: () => {
            toast.success("Workspace Information updated successfully");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update workspace information");
        }
    });

    useEffect(() => {
        if (workspaceInfo) {
            setTitle(workspaceInfo.title);
            setDescription(workspaceInfo.description);
        }
    }, [workspaceInfo]);

    const handleSave = () => {
        mutation.mutate({title, description});
    };

    if (isLoading || !workspaceInfo || isLoadingUserInfo || !currentUserInfo) {
        return (
            <div className="flex items-center gap-x-2">
                <Skeleton className=" h-10 w-full"/>
            </div>
        );
    }

    const isOwner = currentUserInfo?.role === "owner";

    return (
        <div className="workspace-info p-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Workspace Information</h2>
            </div>
            <div>
                {isOwner
                    ? (
                        <div className="flex flex-col w-[50%]">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-gray-600 font-semibold border rounded-lg mb-2 px-2 py-1"
                                placeholder={"Enter workspace title"}
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="text-sm text-gray-600 border rounded-lg px-2 py-1"
                                placeholder={"Enter workspace description"}
                            />
                            <button onClick={handleSave}
                                    className=" mt-2 bg-gray-200 hover:bg-gray-300 p-2 h-8 flex items-center justify-center font-semibold text-xs rounded w-32">
                                Update Workspace
                            </button>
                        </div>
                    )
                    : (
                        <div>
                            <p className="text-2xl font-semibold flex gap-1">
                                {workspaceInfo.title === 'personal' ? 'Personal' : workspaceInfo.title}
                            </p>
                            <p className="text-sm text-gray-600 flex gap-1">
                                {workspaceInfo.description || 'No description'}
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default WorkspaceInfo;