/* eslint-disable @typescript-eslint/no-explicit-any */
import {UpdateCardOrder} from "@/actions/update-card-order/schema";
import {UpdateListOrder} from "@/actions/update-list-order/schema";
import {Card} from "@/types/Board";
import {format, parse, subHours} from "date-fns";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

const buildUrlWithParams = (baseUrl: string, params: any) => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);

    if (params.member) {
        const uniqueMembers = Array.from(new Set(params.member.split(",")));
        queryParams.append("member", uniqueMembers.join(","));
    }

    if (params.due) {
        const validDueValues = ["day", "week", "month"];
        if (validDueValues.includes(params.due)) {
            queryParams.append("due", params.due);
        }
    }

    if (typeof params.dueComplete === "boolean")
        queryParams.append("dueComplete", params.dueComplete.toString());
    if (typeof params.overdue === "boolean")
        queryParams.append("overdue", params.overdue.toString());
    if (typeof params.notDue === "boolean")
        queryParams.append("notDue", params.notDue.toString());

    return `${baseUrl}?${queryParams.toString()}`;
};

export const getBoardColumns = async (params: any, session: any) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns/workspace/${params.organizationId}`;
    const url = buildUrlWithParams(baseUrl, params);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
            "X-User-Email": `${params.userEmail}`,
            "X-Workspace-ID": `${params.organizationId}`,
        },
    });

    const data = await response.json();
    return data;
};

export const getSchedules = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule/schedule?` +
        new URLSearchParams({
            workspace_id: params.checkedWorkspaces.join(","),
            start_time: params.startTime,
            end_time: params.endTime,
            is_deleted: params.isDeleted,
        }).toString(),
        {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": "", // no need to pass due to many user emails
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );
    return await response.json();
};

export const getCardByID = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedules/${params.cardId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    const data = await response.json();
    return data;
};

export const deleteCardByCardID = async (
    params: any,
    session: any
): Promise<Card> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedules/${params.schedule_id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete card");
    }

    const data: Card = await response.json();
    return data;
};

export const getMembersInWorkspace = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/workspace_user_list`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    if (response.status === 500) {
        throw new Error("User does not exist");
    }

    const data = await response.json();
    return data;
};

export const getMembersInWorkspaceByParams = async (
    params: any,
    session: any
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/workspace_user_list`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    if (response.status === 500) {
        throw new Error("User does not exist");
    }

    const data = await response.json();
    return data;
};

export const getMembersInWorkspaceForManage = async (
    params: any,
    session: any
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/manage/wsp_user_list`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    if (response.status === 500) {
        throw new Error("User does not exist");
    }

    const data = await response.json();
    return data;
};

export const getCommentByScheduleID = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/comment/schedule/${params.cardId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    const data = await response.json();
    return data;
};

export const getActivitiesLogs = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_log/schedule/${params.cardId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    const data = await response.json();
    return data;
};

export const getListUserInvite = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user_email/search-user_email/${params.email}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();
    return data;
};

export const inviteMemberToWorkspace = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/send-invitation`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                role: params.role,
            }),
        }
    );
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "This email is not registered") {
            throw new Error("This email is not registered");
        } else {
            throw new Error("Failed to send invitation");
        }
    }
    const data = await response.json();
    return data;
};

export const inviteMemberToWorkspaceByMember = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/member/send-invitation`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                role: params.role,
            }),
        }
    );
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "This email is not registered") {
            throw new Error("This email is not registered");
        } else {
            throw new Error("Failed to send invitation");
        }
    }
    const data = await response.json();
    return data;
};

export const updateRole = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/update-role`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                role: params.role,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update role");
    }

    const data = await response.json();
    return data;
};

export const removeMember = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/delete-workspace_user/workspace_user_id/${params.workspaceUserId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    return data;
};

export const inviteMemberToCard = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_participant/invite`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                schedule_id: params.schedule_id,
            }),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to invite member");
    }
    const data = await response.json();
    return data;
};

export const removeParticipantFromSchedule = async (
    params: any,
    session: any
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_participant/remove/${params.participantId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.scheduleId,
            }),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to remove participant");
    }
    return await response.json();
};

//add comment
export const addComment = async (params: any, session: any): Promise<Card> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/comment`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.schedule_id,
                content: params.content,
                commenter: "",
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add comment");
    }

    const data: Card = await response.json();
    return data;
};

//detele comment by comment id
export const deleteComment = async (
    params: any,
    session: any
): Promise<Card> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/comment/${params.commentId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data: Card = await response.json();
    return data;
};

//edit commnent
export const editComment = async (params: any, session: any): Promise<Card> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/comment/${params.commentId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.schedule_id,
                content: params.content,
                commenter: "",
            }),
        }
    );
    const data: Card = await response.json();
    return data;
};

//assignee
export const AssigneeSchedules = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_participant/assign`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                schedule_id: params.schedule_id,
                organizationId: params.organizationId,
            }),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to assignee");
    }
    const data = await response.json();
    return data;
};

export const UnassignSchedule = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_participant/unassign/${params.participantId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.scheduleId,
            }),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to unassign");
    }
    const data = await response.json();
    return data;
};

//get schedule by id
export const getScheduleByID = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedule_participant/schedule/${params.schedule_id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );
    const data = await response.json();
    return data;
};

//get user information
export const getAccountInformation = async (session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user?status=linked`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    return data;
};

export const getAccountInformationForSchedule = async (session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    return data;
};

//update board column by board id
export const updateListBoardColumns = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns/${params.listId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: params.name,
            }),
        }
    );
    const data = await response.json();
    return data;
};

//update card information
export const updateCardID = async (
    params: any,
    session: any
): Promise<Card> => {
    const startTime = params.start_time;
    const endTime = params.end_time;

    const parsedStartTime = parse(startTime, "yyyy-MM-dd HH:mm:ss.SSS", new Date());
    const parsedEndTime = parse(endTime, "yyyy-MM-dd HH:mm:ss.SSS", new Date());

    const adjustedStartTime = subHours(parsedStartTime, 7);
    const adjustedEndTime = subHours(parsedEndTime, 7);

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedules/${params.cardId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId || params.workspace_id}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                all_day: params.all_day,
                description: params.description,
                end_time: format(adjustedEndTime, "yyyy-MM-dd HH:mm:ss.SSS"),
                extra_data: params.extra_data,
                location: params.location,
                priority: params.priority,
                recurrence_pattern: params.recurrence_pattern,
                start_time: format(adjustedStartTime, "yyyy-MM-dd HH:mm:ss.SSS"),
                status: params.status,
                title: params.title,
                video_transcript: params.video_transcript,
                visibility: params.visibility,
                workspace_id: params.workspace_id,
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update card");
    }

    const data: Card = await response.json();
    return data;
};

export const getDocumentByScheduleID = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/document/schedule/${params.cardId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    return data;
};

export const updateCardPosition = async (params: any, session: any) => {
    const validatedFields = UpdateCardOrder.safeParse(params);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedules/position/${params.cardId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                board_column_id: params.board_column_id,
                position: params.position,
            }),
        }
    );

    if (!response.ok) {
        if (response.status === 500) {
            throw new Error("Server error: Failed to update card position");
        } else {
            throw new Error("Failed to update card position");
        }
    }

    return response.json();
};

export const updateBoardOrder = async (params: any, session: any) => {
    const validatedFields = UpdateListOrder.safeParse(params);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns/update_position/${params.boardColumnId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                position: params.position,
            }),
        }
    );

    if (!response.ok) {
        if (response.status === 500) {
            throw new Error("Server error: Failed to update Board position");
        } else {
            throw new Error("Failed to update Board position");
        }
    }

    const data = await response.json();
    return data;
};

export const fetchWorkspaces = async (params: any, session: any) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/get-workspaces-by-email/${params}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session?.user.access_token}`,
                },
            }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch workspaces");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw error;
    }
};

export const fetchWorkspaceDetails = async (params: any, session: any) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/get-workspace-by-id/${params}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session?.user.access_token}`,
                },
            }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch workspaces");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw error;
    }
};

//get all reminder participant
export const getReminderParticipant = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/schedule/${params.schedule_id}/all_participants`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    const data = await response.json();
    return data;
};

//get personal reminder
export const getReminderPersonal = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/schedule/${params.schedule_id}/only_me`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
            },
        }
    );

    const data = await response.json();
    return data;
};

//update reminder participant
export const updateReminderParticipant = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/all_participants/${params.reminder_id}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reminder_time: params.reminder_time,
                schedule_id: params.schedule_id,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update reminder");
    }

    return await response.json();
};

//add personal reminder
export const addPersonalReminder = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/only_me`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.schedule_id,
            }),
        }
    );
    const data = await response.json();
    return data;
};

//add all reminder
export const addAllReminder = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/all_participants`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule_id: params.schedule_id,
            }),
        }
    );
    if (!response.ok) {
        throw new Error(response.json().text);
    }
    const data = await response.json();
    return data;
};

// Update reminder participant
export const updateReminderPersonal = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/only_me/${params.reminder_id}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                time: params.time,
                schedule_id: params.schedule_id,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update reminder");
    }

    const data = await response.json();
    return data;
};

//remove personal reminder
export const removePersonalReminder = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reminder/${params.reminder_id}/schedule/${params.schedule_id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Reminder not found");
        }
        throw new Error("Failed to remove reminder");
    }

    const data = await response.json();
    return data;
};

//trigger the meeting
export const triggerMeeting = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/meeting_bot/start`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.workspace_id}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                meet_link: params.meet_link,
                schedule_id: params.schedule_id,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to trigger meeting");
    }

    const data = await response.json();
    return data;
};

export const getCurrentWorkspaceUserInfo = async (
    params: any,
    session: any
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/get-workspace_user/email/${params.userEmail}/workspace_id/${params.organizationId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get current workspace user");
    }

    const data = await response.json();
    return data;
};

export const deleteWorkspace = async (workspaceId: string, userEmail: string, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/delete-workspace`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user?.access_token}`,
                "X-User-Email": userEmail,
                "X-Workspace-ID": workspaceId,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to delete workspace");
    }
};

export const updateWorkspace = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/update-workspace`,
        {
            method: "PUT",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": params.userEmail,
                "X-Workspace-Id": params.workspaceId,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description: params.description,
                title: params.title,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update workspace");
    }
    return await response.json();
};