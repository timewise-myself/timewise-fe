/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {ArchiveIcon, BellPlus, Gauge, Theater,} from "lucide-react";
import React from "react";
import {DatePicker} from "./date-picker";
import Assignee from "./assignee";
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {useQuery} from "@tanstack/react-query";
import {Participant} from "@/types/Board";
import {getDocumentByScheduleID, getReminderParticipant, getReminderPersonal, getScheduleByID,} from "@/lib/fetcher";
import AllReminder from "./all-reminder";
import PersonalReminder from "./personal-reminder";
import Document from "./document";
import Visibility from "./Visibility";
import Status from "./status";
import {checkSchedulePermission, ScheduleAction} from "@/constants/roles";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";
import Participants from "@components/modals/Participants";

interface Props {
    data: any;
}

const Content = ({data}: Props) => {
    const {data: session} = useSession();
    const params = useParams();
    const {stateWorkspacesByEmail, stateUserEmails} = useStateContext();

    const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(data.workspace_id)
    );

    const {data: scheduleParticipant} = useQuery<Participant>({
        queryKey: ["scheduleParticipant"],
        queryFn: async () => {
            const response = await getScheduleByID(
                {
                    schedule_id: data.id,
                    organizationId: params.organizationId || data.workspace_id,
                    userEmail: userEmail?.email,
                },
                session
            );
            return response;
        },
        enabled: !!data.id && !!session,
    });

    const {data: allReminder} = useQuery({
        queryKey: ["allReminder"],
        queryFn: async () => {
            const fetchedReminders = await getReminderParticipant(
                {
                    schedule_id: data.id,
                    organizationId: params.organizationId || data.workspace_id,
                    userEmail: userEmail?.email,
                },
                session
            );
            fetchedReminders.workspaceId = data.workspace_id;

            return fetchedReminders;
        },
        enabled: !!data.id && !!session,
    });

    const {data: personalReminder} = useQuery({
        queryKey: ["personalReminder"],
        queryFn: async () => {
            const fetchedPersonalReminder = await getReminderPersonal(
                {
                    schedule_id: data.id,
                    organizationId: params.organizationId || data.workspace_id,
                    userEmail: userEmail?.email,
                },
                session
            );
            fetchedPersonalReminder.workspaceId = data.workspace_id;
            return fetchedPersonalReminder;
        },
        enabled: !!data.id && !!session,
    });

    const {data: documents} = useQuery({
        queryKey: ["documents"],
        queryFn: async () => {
            const response = await getDocumentByScheduleID(
                {
                    cardId: data.id,
                    organizationId: params.organizationId || data.workspace_id,
                    userEmail: userEmail?.email,
                },
                session
            );
            return response;
        },
        enabled: !!data.id && !!session,
    });

    return (
        <>
            <div className="flex items-start flex-col justify-between w-full">
                <Visibility
                    data={data}
                    disabled={
                        !checkSchedulePermission(data.extra_data, ScheduleAction.visibility)
                    }
                />
                <Status
                    data={data}
                    disabled={
                        !checkSchedulePermission(data.extra_data, ScheduleAction.status)
                    }
                />
                <div className="flex flex-row items-center gap-x-2 text-md font-medium text-gray-400 mt-2">
                    <Theater className="h-4 w-4 items-center text-gray-400"/>
                    <p className="text-gray-400 w-[100px]">Tags</p>
                    <div className="flex flex-row items-center gap-x-1">
                        <span
                            className={"w-fit px-2 py-1 leading-tight inline-flex items-center bg-teal-100 rounded"}
                        >
                                <Gauge className="h-3 w-3 "/>
                                <span className={"text-sm ml-2  font-medium text-teal-900"}>Board</span>
                        </span>
                    </div>
                </div>
                <DatePicker
                    data={data}
                    disabled={
                        !checkSchedulePermission(data.extra_data, ScheduleAction.date)
                    }
                />


                <div className="flex gap-x-2 w-full items-center text-gray-400 mt-2">
                    <BellPlus className="w-4 h-4"/>
                    <p className="w-[100px]">Reminders</p>
                </div>
                <div className="flex flex-row items-center gap-x-3">
                    <AllReminder
                        data={allReminder}
                        schedule={data}
                        disabled={
                            !checkSchedulePermission(
                                data.extra_data,
                                ScheduleAction.reminder_participant
                            )
                        }
                    />
                </div>
                <div className="flex flex-row items-center gap-x-3">
                    <PersonalReminder
                        data={personalReminder}
                        schedule={data}
                        disabled={
                            !checkSchedulePermission(
                                data.extra_data,
                                ScheduleAction.reminder_personal
                            )
                        }
                    />
                </div>
            </div>

            <Participants scheduleData={data} participantsData={scheduleParticipant}/>
            <div className="flex flex-row items-center text-gray-400 mt-1">
                <div className="h-4 w-4 mr-2"/>
                <p className="w-[105px]">Assignee</p>
                <p className="text-yellow-500">{scheduleParticipant?.email}</p>
                <div className="flex flex-row items-center gap-x-1">
                    <Assignee
                        participant={scheduleParticipant}
                        data={data}
                    />
                </div>
            </div>

            <div className="text-gray-400">
                <Document
                    data={data}
                    document={documents}
                    disabled={
                        !checkSchedulePermission(data.extra_data, ScheduleAction.document)
                    }
                />
            </div>
        </>
    );
};

Content.Skeleton = function SkeletonContent() {
    return (
        <div className="flex flex-row items-center gap-x-3">
            <ArchiveIcon className="h-4 w-4 text-gray-500"/>
            <div className="w-20 h-4 bg-gray-200 rounded-md"/>
        </div>
    );
};

export default Content;
