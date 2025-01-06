/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useEffect, useState } from "react";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";
import {
  viewDay,
  viewMonthAgenda,
  viewMonthGrid,
  viewWeek,
} from "@schedule-x/calendar";
import { format } from "date-fns";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import ScheduleDetailsDrawer from "@components/view-calender/custom-event-modal";
import { useCardModal } from "@/hooks/useCardModal";
import { Calendars } from "@/utils/calendar/calendarUtils";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { useSession } from "next-auth/react";
import { updateCardID } from "@/lib/fetcher";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface CalendarAppProps {
  scheduleData: any[];
  workspaceData: Calendars;
}

function CalendarApp({ scheduleData, workspaceData }: CalendarAppProps) {
  const [isModalOpen] = useState(false);
  const [selectedEventId] = useState<string | null>(null);
  const cardModal = useCardModal();
  const { data: session } = useSession();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const calendarApp = useNextCalendarApp({
    views: [viewWeek, viewMonthAgenda, viewDay, viewMonthGrid],
    defaultView: viewMonthGrid.name,
    events: scheduleData,
    plugins: [
      createDragAndDropPlugin(15),
      createEventsServicePlugin(),
      createCalendarControlsPlugin(),
    ],
    selectedDate: format(new Date(), "yyyy-MM-dd"),
    calendars: workspaceData,
    callbacks: {
      onEventClick: (event) => {
        cardModal.onOpen(event.id.toString(), event.workspaceId);
      },
      onClickDate() {},
      onClickDateTime() {},
      onEventUpdate(event) {
        updateScheduleTime(event, scheduleData).then((r) => console.log(r));
      },
    },
  }) as any;

  const updateScheduleTime = (event: any, rawScheduleData: any) => {
    const updatedSchedule = rawScheduleData.find(
      (schedule: any) => schedule.id === event.id
    );

    const updatedStart = new Date(event.start);
    const updatedStartStr = format(updatedStart, "yyyy-MM-dd HH:mm:ss.SSS");
    const updatedEnd = new Date(event.end);
    const updatedEndStr = format(updatedEnd, "yyyy-MM-dd HH:mm:ss.SSS");

    const userEmail = getUserEmailByWorkspace(
      stateUserEmails,
      stateWorkspacesByEmail,
      Number(updatedSchedule.workspace_id)
    );

    return updateCardID(
      {
        cardId: updatedSchedule.id,
        visibility: updatedSchedule.visibility,
        all_day: updatedSchedule.all_day,
        description: updatedSchedule.description,
        end_time: updatedEndStr,
        extra_data: updatedSchedule.extra_data,
        location: updatedSchedule.location,
        priority: updatedSchedule.priority,
        recurrence_pattern: updatedSchedule.recurrence_pattern,
        start_time: updatedStartStr,
        status: updatedSchedule.status,
        title: updatedSchedule.title,
        organizationId: updatedSchedule.workspace_id,
        userEmail: userEmail?.email,
      },
      session
    );
  };

  useEffect(() => {
    if (calendarApp) {
      calendarApp.eventsService.set(scheduleData);
      // update onEventUpdate callback
      calendarApp.$app.config.callbacks.onEventUpdate = (event: any) => {
        updateScheduleTime(event, scheduleData).then((r) => console.log(r));
      };
    }
  }, [scheduleData, calendarApp]);

  return (
    <div className="w-full max-w-[100vw] h-full">
      <ScheduleXCalendar calendarApp={calendarApp} />
      {isModalOpen && <ScheduleDetailsDrawer eventId={selectedEventId} />}
    </div>
  );
}

export default CalendarApp;
