/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import CalendarApp from "@/components/view-calender/calender";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getSchedules } from "@/lib/fetcher";
import { useStateContext } from "@/stores/StateContext";
import CalendarFilter from "@components/view-calender/calendar-filter";
import {
  Calendars,
  getWorkspaceData,
  transformScheduleData,
} from "@/utils/calendar/calendarUtils";

const CalenderPage = () => {
  const { data: session } = useSession();
  const [checkedWorkspaces, setCheckedWorkspaces] = useState<string[]>([]);
  const { stateWorkspacesByEmail } = useStateContext();

  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<Calendars>({});

  const handleCheckedWorkspacesChange = (checkedWorkspaces: string[]) => {
    setCheckedWorkspaces(checkedWorkspaces);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["schedules", checkedWorkspaces],
    queryFn: async () => {
      if (checkedWorkspaces.length === 0) {
        return [];
      }

      const payload = {
        checkedWorkspaces,
        startTime: "0001-10-01 00:00:00.000",
        endTime: "9999-12-31 23:59:59.000",
        isDeleted: false,
      };
      const response = await getSchedules(payload, session);
      return response || [];
    },
    enabled: !!session,
  });

  useEffect(() => {
    const transformedWorkspaceData = getWorkspaceData(stateWorkspacesByEmail);
    setWorkspaceData(transformedWorkspaceData);
  }, [stateWorkspacesByEmail]);

  useEffect(() => {
    if (!isLoading && data) {
      setScheduleData(transformScheduleData(data));
    }
  }, [isLoading, data]);

  if (!scheduleData || Object.keys(workspaceData).length === 0) {
    return <div className="w-full h-full">Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      {workspaceData && (
        <div className="w-full max-w-[100vw] h-full flex gap-1">
          <CalendarFilter
            workspaceData={stateWorkspacesByEmail}
            workspaceDataTransformed={workspaceData}
            onCheckedWorkspacesChange={handleCheckedWorkspacesChange}
          />
          <CalendarApp
            scheduleData={scheduleData}
            workspaceData={workspaceData}
          />
        </div>
      )}
    </div>
  );
};

export default CalenderPage;
