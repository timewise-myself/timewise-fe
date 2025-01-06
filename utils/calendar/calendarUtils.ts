/* eslint-disable @typescript-eslint/no-explicit-any */
import {Schedule} from "@/types/Calendar";
import {format, parseISO} from "date-fns";
import {Workspace} from "@/types/Board";

export const transformScheduleData = (data: any): any[] => {
    if (!Array.isArray(data)) {
        console.error("Expected an array, received:", data);
        return [];
    }
    return data.map((schedule: Schedule) => {
        let start,
            end = "";
        if (schedule.all_day) {
            start = format(parseISO(schedule.start_time), "yyyy-MM-dd");
            end = format(parseISO(schedule.end_time), "yyyy-MM-dd");
        } else {
            start = format(parseISO(schedule.start_time), "yyyy-MM-dd HH:mm");
            end = format(parseISO(schedule.end_time), "yyyy-MM-dd HH:mm");
        }
        return {
            ...schedule,
            id: schedule.id.toString(),
            title: schedule.title,
            with: "",
            start: start,
            end: end,
            color: "",
            isEditable: false,
            location: schedule.location,
            topic: "",
            workspaceId: schedule.workspace_id.toString(),
            calendarId: schedule.workspace_id.toString(),
        };
    });
};

type CalendarColors = {
    main: string;
    container: string;
    onContainer: string;
};

type Calendar = {
    colorName: string;
    lightColors: CalendarColors;
    email: string;
};

export type Calendars = Record<string, Calendar>;

const generateColors = (workspaceId: string) => {
    // Enhanced hash function to improve color differentiation
    const enhancedHash = (input: string) => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };


    const hash = enhancedHash((parseInt(workspaceId) * 69).toString());

    // Use modular arithmetic with a prime number to spread hash values
    const spreadValue = hash % 997; // Using a prime number for better distribution
    const hue = (hash + spreadValue) % 360; // Ensure hue is between 0-359
    const saturation = 60; // Pastel saturation
    const lightnessMain = 70; // Main color lightness
    const lightnessContainer = 90; // Container color lightness
    const lightnessOnContainer = 30; // On container color lightness

    // Helper function to convert HSL to HEX
    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0'); // Convert to HEX
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Generate colors
    return {
        colorName: workspaceId,
        lightColors: {
            main: hslToHex(hue, saturation, lightnessMain),
            container: hslToHex(hue, saturation, lightnessContainer),
            onContainer: hslToHex(hue, saturation, lightnessOnContainer),
        },
    };
};

export const getWorkspaceData = (stateWorkspacesByEmail: Record<string, Workspace[]>) => {
    const result: Calendars = {};

    Object.entries(stateWorkspacesByEmail).forEach(([email, workspaces]) => {
        workspaces.forEach(workspace => {
            result[workspace.ID.toString()] = {
                ...generateColors(workspace.ID.toString()),
                email: email,
            };
        });
    });

    return result;
};