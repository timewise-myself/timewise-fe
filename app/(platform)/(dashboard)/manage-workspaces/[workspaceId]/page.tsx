/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {Workspace} from "@/types/Board";
import {useQuery} from "@tanstack/react-query";
import {fetchWorkspaceDetails, getBoardColumns} from "@/lib/fetcher";
import Link from "next/link";
import {useSession} from "next-auth/react";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface WorkspaceDetailsProps {
    params: { workspaceId: string };
}

// Workspace details page
const WorkspaceDetails = ({params}: WorkspaceDetailsProps) => {
    const {data: session} = useSession();
    const {workspaceId} = params;
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();

    // Fetch workspace details
    const {data: workspace, isLoading: isWorkspaceLoading, error: workspaceError} = useQuery<Workspace>({
        queryKey: ["workspaceDetails", workspaceId],
        queryFn: () => fetchWorkspaceDetails(workspaceId as string, session),
        enabled: !!workspaceId,
    });

    const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(workspaceId));

    // Fetch board columns
    const {data: boardColumns = [], isLoading: isBoardColumnsLoading, error: boardColumnsError} = useQuery<any[]>({
        queryKey: ["boardColumns", workspaceId],
        queryFn: () =>
            getBoardColumns({organizationId: workspaceId as string, userEmail: userEmail?.email}, session),
        enabled: !!workspaceId && !!session,
    });

    // Loading state
    if (isWorkspaceLoading || isBoardColumnsLoading) {
        return <div>Loading...</div>;
    }

    // Error state
    if (workspaceError || boardColumnsError) {
        return <div>Error loading workspace or board columns. Please try again later.</div>;
    }

    // Workspace not found
    if (!workspace) {
        return <div>Workspace not found.</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">{workspace.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{workspace.description}</p>

                {/* Board Columns */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Board Columns</h2>
                    {boardColumns.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-2">No board column available</p>
                    ) : (
                        boardColumns.map((column: any) => (
                            <div key={column.id} className="bg-white p-6 rounded-xl shadow-lg mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">{column.name}</h3>
                                <p className="text-sm text-gray-500">{column.description}</p>

                                {/* Schedules */}
                                <p className="text-sm text-gray-500 mt-2">Schedules:</p>
                                {(column.schedules ?? []).length === 0 ? (
                                    <p className="text-sm text-gray-500 mt-2">No schedules available</p>
                                ) : (
                                    <ul className="mt-2 space-y-2">
                                        {column.schedules.map((schedule: any) => (
                                            <li key={schedule.id} className="border p-3 rounded-md bg-gray-100">
                                                <h4 className="text-md font-medium">{schedule.title}</h4>
                                                <p className="text-sm text-gray-500">{schedule.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    Start: {schedule.start_time} | End: {schedule.end_time}
                                                </p>
                                                <p className="text-sm text-gray-500">Status: {schedule.status}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Create New Task Button */}
                <div className="mt-6">
                    <Link
                        href={`/workspaces/${workspaceId}/create-task`}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                    >
                        Create New Task
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetails;
