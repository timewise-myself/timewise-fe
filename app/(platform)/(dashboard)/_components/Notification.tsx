/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {Bell, Dot} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/Button";
import HintTool from "@components/hint-tool";
import {useStateContext} from "@/stores/StateContext";
import {useQuery} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {Workspace} from "@/types/Board";

const fetchNotifications = async (token: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/notification`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const data = await response.json();
    return data.map((workspace: Workspace) => workspace);
};

const readNotification = async (token: string, notificationId: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/notification/${notificationId}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to mark notification as read");
    }
    return response.json();
}

const transformNotificationData = (notificationData: any) => {
    return notificationData.filter(noti => noti.title !== '').sort((a: any, b: any) => b.ID - a.ID).map((notification: any) => {
        const unclickableNotificationTitles = [
            "Link Email Request",
            "Email Removal",
            ""
        ]
        const unclickableNotificationTypes = [
            "workspace_invitation",
        ]
        if (unclickableNotificationTitles.includes(notification.title) || unclickableNotificationTypes.includes(notification.type)) {
            notification.link = ''
        }
        return {
            id: notification.ID,
            title: notification.title,
            description: notification.description,
            link: notification.link !== '' ? notification.link : null,
            is_read: notification.is_read
        }
    });
};

const Notification = () => {
    const {stateNotifications, setStateNotifications} = useStateContext();
    const {data: session} = useSession();

    const {} = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            if (!session) {
                return [];
            }
            const notificationData = await fetchNotifications(session.user.access_token || '');
            const transformedNotifications = transformNotificationData(notificationData)
            setStateNotifications(transformedNotifications);
            return transformedNotifications;
        },
        enabled: !!session,
        refetchInterval: 5000,
    });

    const handleReadNotification = (notification: any) => () => {
        if (notification.is_read) {
            return;
        }
        readNotification(session.user.access_token || '', notification.id).then(() => {
            setStateNotifications((prevNotifications: any) => {
                return prevNotifications.map((prevNotification: any) => {
                    if (prevNotification.id === notification.id) {
                        return {
                            ...prevNotification,
                            is_read: true
                        }
                    }
                    return prevNotification
                })
            })
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-transparent hover:bg-transparent relative">
                    <Bell className="w-6 h-6 hover:shadow-2xl" color="#000"/>
                    {stateNotifications.some((notification) => !notification.is_read) ? (
                        <Dot className="h-10 w-10 absolute top-[-10px] right-[-5px]" color="#3874CB"/>) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 space-y-2 max-h-[600px]">
                <DropdownMenuLabel className="text-lg">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup className="overflow-y-auto max-h-[484px]">
                    {stateNotifications.length > 0 ? (
                        stateNotifications.map((notification) => (
                            <div>
                                <DropdownMenuItem key={notification.id} className="cursor-pointer"
                                                  onClick={handleReadNotification(notification)}>
                                    <HintTool side="left" sideOffSet={20} description={
                                        <div className="flex flex-col gap-y-1">
                                            <h2 className="font-semibold">{notification.title}</h2>
                                            <p>{notification.description || 'No Description'}</p>
                                        </div>
                                    }>
                                        {notification.link ? (<a href={notification.link}
                                                                 className="flex justify-between align-baseline w-full text-left">
                                            <div className="w-64">
                                                <h2 className="font-semibold overflow-hidden overflow-ellipsis text-nowrap">{notification.title}</h2>
                                                <p className="overflow-hidden overflow-ellipsis text-nowrap">{notification.description}</p>
                                            </div>
                                            {!notification.is_read ? (
                                                <div>
                                                    <Dot className="h-10 w-10" color="#3874CB"/>
                                                </div>
                                            ) : null}
                                        </a>) : (
                                            (<div className="flex justify-between align-baseline w-full text-left">
                                                <div className="w-64">
                                                    <h2 className="font-semibold overflow-hidden overflow-ellipsis text-nowrap">{notification.title}</h2>
                                                    <p className="overflow-hidden overflow-ellipsis text-nowrap">{notification.description}</p>
                                                </div>
                                                {!notification.is_read ? (
                                                    <div>
                                                        <Dot className="h-10 w-10" color="#3874CB"/>
                                                    </div>
                                                ) : null}
                                            </div>)
                                        )}
                                    </HintTool>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                            </div>
                        ))
                    ) : (
                        <DropdownMenuItem className="cursor-pointer">
                            No notifications
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notification;