/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useEffect, useRef, useState} from "react";
import {Airplay} from "lucide-react"; // Only keep the icon for the "Join Requests" tab
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {Separator} from "@/components/ui/separator";
import {useQuery} from "@tanstack/react-query";
import JoinRequest from "./join-request";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
    currentUserInfo: any;
}

// Keep only the "Join Requests" tab data
const TAB_DATA = [
    {
        icon: <Airplay className="w-4 h-4"/>, // Only keep the icon for Join Requests
        label: "Join Requests",
    },
];

export const getUnverifiedMembers = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace_user/get-workspace_user_invitation_not_verified_list`,
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

const Tab = ({ currentUserInfo }: Props) => {
    const [activeTab, setActiveTab] = useState(TAB_DATA[0].label); // Default active tab is "Join Requests"
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
    const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
    const tabsRef = useRef<(HTMLElement | null)[]>([]);
    const {data: session} = useSession();
    const params = useParams();
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();

    const handleChangeTab = (tab: string, index: number) => {
        setActiveTab(tab);
        setActiveTabIndex(index);
    };

    const {data: unverifiedMembers} = useQuery({
        queryKey: ["unverifiedMembers", params.organizationId],
        queryFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }
            const data = await getUnverifiedMembers({...params, userEmail: userEmail.email}, session);
            return data;
        },
        enabled: activeTab === "Join Requests", // Only fetch data for Join Requests tab
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
        <div className="w-full">
            <div className="relative right-0">
                <ul
                    className="relative flex flex-wrap px-1.5 py-1.5 list-none rounded-md"
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
                            rounded-sm cursor-pointer h-auto
                            ${activeTab === tab.label ? "bg-sky-100" : "bg-white"}
                            transition duration-300`}
                            onClick={() => handleChangeTab(tab.label, index)}
                        >
                            <a className="flex items-center justify-center p-2">
                                {tab.icon}
                                <span className="text-sm ml-2">{tab.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
                <Separator />
                <div className="p-4">
                    {activeTab === "Join Requests" && (
                        <JoinRequest data={unverifiedMembers} currentUserInfo={currentUserInfo}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tab;
