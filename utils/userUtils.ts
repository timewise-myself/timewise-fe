/* eslint-disable */
import {Workspace} from "@/types/Board";

export const getUserEmailByWorkspace = (
    stateUserEmails: { email: string; id: number; status: string }[],
    stateWorkspacesByEmail: Record<string, Workspace[]>,
    workspaceId: number
) => {
    const matchingEmails = [];
    for (const email in stateWorkspacesByEmail) {
        const workspaces = stateWorkspacesByEmail[email];
        if (workspaces.some((workspace) => workspace.ID === workspaceId)) {
            const workspace = workspaces.find(workspace => workspace.ID === workspaceId);
            const userEmail = stateUserEmails.find(userEmail => userEmail.email === email)
            matchingEmails.push({
                ...workspace,
                ...userEmail
            });
        }
    }
    if (matchingEmails.length > 0) {
        const rolePriority = {
            owner: 1,
            admin: 2,
            member: 3,
            guest: 4,
        };

        matchingEmails.sort((a, b) => {
            return rolePriority[a.extra_data] - rolePriority[b.extra_data];
        });

        return matchingEmails[0];
    }
    return null;
};
