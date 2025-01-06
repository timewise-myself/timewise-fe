/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useEffect, useRef, useState} from "react";
import {Airplay, AirplayIcon, AirVent} from "lucide-react";
import {Separator} from "../ui/separator";
import {useQuery} from "@tanstack/react-query";
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {getActivitiesLogs, getCommentByScheduleID} from "@/lib/fetcher";
import Comments from "./comments";
import Activities from "./activities";
import Meetting from "./meeting";
import {checkSchedulePermission, ScheduleAction} from "@/constants/roles";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
    id: string | undefined;
    data: any;
}

const TAB_DATA = [
    {
        icon: <AirVent className="h-4 w-4"/>,
        label: "Comments",
        href: "comments",
    },
    {
        icon: <Airplay className="w-4 h-4"/>,
        label: "Activities",
        href: "activities",
    },
    {
        icon: <AirplayIcon className="w-4 h-4"/>,
        label: "Meet",
        href: "meet",
    },
];

const Tab = ({id, data}: Props) => {
    const [activeTab, setActiveTab] = useState(TAB_DATA[0].label);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
    const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
    const tabsRef = useRef<(HTMLElement | null)[]>([]);
    const {data: session} = useSession();
    const params = useParams();
    const {stateWorkspacesByEmail, stateUserEmails} = useStateContext();

    const handleChangeTab = (tab: string, index: number) => {
        setActiveTab(tab);
        setActiveTabIndex(index);
    };

    const {data: comments} = useQuery({
        queryKey: [
            "listComments",
            {cardId: id, organizationId: params.organizationId},
        ],
        queryFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(data.workspace_id));

            return await getCommentByScheduleID(
                {cardId: id, organizationId: params.organizationId || data.workspace_id, userEmail: userEmail?.email},
                session
            );
        },
        enabled: !!id && !!session && activeTab === "Comments" && !!data,
    });

    const {data: activities} = useQuery({
        queryKey: [
            "listActivities",
            {cardId: id, organizationId: params.organizationId},
        ],
        queryFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(data.workspace_id));
            const logsData = await getActivitiesLogs(
                {cardId: id, organizationId: params.organizationId, userEmail: userEmail?.email},
                session
            );
            return logsData;
        },
        enabled: !!id && !!session && activeTab === "Activities",
    });

    useEffect(() => {
        const setTabPosition = () => {
            const currentTab = tabsRef.current[activeTabIndex] as HTMLElement;
            setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
            setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
        };

        setTabPosition();
    }, [activeTabIndex]);

    return (
        <div className="w-full h-[500px]">
            <div className="relative right-0">
                <ul
                    className="relative flex flex-wrap list-none rounded-md"
                    data-tabs="tabs"
                    role="list"
                >
          <span
              className="absolute bottom-0 h-1 bg-sky-200 transition-all duration-300"
              style={{left: tabUnderlineLeft, width: tabUnderlineWidth}}
          />
                    {TAB_DATA.map((tab, index) => (
                        <li
                            key={index}
                            ref={(el) => {
                                tabsRef.current[index] = el;
                            }}
                            className={`flex-auto text-center hover:bg-gray-100 transition-all ease-in-out 
                rounded-sm cursor-pointer
                ${activeTab === tab.label ? "bg-sky-100" : "bg-white"}
                transition duration-300`}
                            onClick={() => handleChangeTab(tab.label, index)}
                        >
                            <a className="flex items-center justify-center p-2">
                                {tab.icon}
                                <span className="ml-2">{tab.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
                <Separator/>
                <div className="pt-4">
                    {activeTab === "Comments" && (
                        <Comments session={session} data={comments} scheduleId={id} workspaceId={data?.workspace_id}/>
                    )}
                    {activeTab === "Activities" && (
                        <Activities session={session} activities={activities}/>
                    )}
                    {activeTab === "Meet" && (
                        <Meetting session={session} data={data} scheduleId={id}
                                  disabled={!checkSchedulePermission(data?.extra_data, ScheduleAction.meet)}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tab;
