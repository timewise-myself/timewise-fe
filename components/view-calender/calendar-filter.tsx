import React, { useCallback, useEffect, useRef, useState } from "react";
import { Workspace } from "@/types/Board";
import AddSchedule from "@/app/(platform)/(dashboard)/organization/[organizationId]/_components/add-schedule";
import { Calendars } from "@/utils/calendar/calendarUtils";
import { Checkbox } from "../ui/checkbox";

interface CalendarFilterProps {
  workspaceData: Record<string, Workspace[]>;
  workspaceDataTransformed: Calendars;
  onCheckedWorkspacesChange: (checkedWorkspaces: string[]) => void;
}

const getWorkspaceId = (workspaces: Record<number, boolean>) => {
  const workspaceIds: string[] = [];
  for (const [key, value] of Object.entries(workspaces)) {
    if (value) {
      workspaceIds.push(key);
    }
  }
  return workspaceIds;
};

const useDebounce = (callback: (args: string[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (args: string[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(args);
    }, delay);
  };
};

function CalendarFilter({
  workspaceData,
  workspaceDataTransformed,
  onCheckedWorkspacesChange,
}: CalendarFilterProps) {
  const [checkedEmails, setCheckedEmails] = useState<Record<string, boolean>>(
    {}
  );
  const [checkedWorkspaces, setCheckedWorkspaces] = useState<
    Record<number, boolean>
  >({});

  const debouncedCheckedWorkspacesChange = useDebounce(
    onCheckedWorkspacesChange,
    300
  );

  useEffect(() => {
    const initialCheckedEmails: Record<string, boolean> = {};
    const initialCheckedWorkspaces: Record<number, boolean> = {};

    Object.keys(workspaceData).forEach((email) => {
      initialCheckedEmails[email] = true;
      workspaceData[email].forEach((workspace) => {
        initialCheckedWorkspaces[workspace.ID] = true;
      });
    });

    setCheckedEmails(initialCheckedEmails);
    setCheckedWorkspaces(initialCheckedWorkspaces);
    debouncedCheckedWorkspacesChange(getWorkspaceId(initialCheckedWorkspaces));
  }, [workspaceData]);

  const handleEmailChange = useCallback(
    (email: string) => {
      const isChecked = !checkedEmails[email];
      setCheckedEmails((prev) => ({ ...prev, [email]: isChecked }));

      const updatedWorkspaces = { ...checkedWorkspaces };
      workspaceData[email].forEach((workspace) => {
        updatedWorkspaces[workspace.ID] = isChecked;
      });

      setCheckedWorkspaces(updatedWorkspaces);
      debouncedCheckedWorkspacesChange(getWorkspaceId(updatedWorkspaces));
    },
    [
      checkedEmails,
      checkedWorkspaces,
      workspaceData,
      debouncedCheckedWorkspacesChange,
    ]
  );

  const handleWorkspaceChange = useCallback(
    (workspaceId: number) => {
      setCheckedWorkspaces((prev) => {
        const isChecked = !prev[workspaceId];
        const updatedWorkspaces = { ...prev, [workspaceId]: isChecked };

        const email = Object.keys(workspaceData).find((email) =>
          workspaceData[email].some((workspace) => workspace.ID === workspaceId)
        );

        if (email) {
          if (!isChecked) {
            setCheckedEmails((prevEmails) =>
              prevEmails[email] ? { ...prevEmails, [email]: false } : prevEmails
            );
          } else {
            const allWorkspacesChecked = workspaceData[email].every(
              (workspace) => updatedWorkspaces[workspace.ID]
            );
            if (allWorkspacesChecked) {
              setCheckedEmails((prevEmails) => ({
                ...prevEmails,
                [email]: true,
              }));
            }
          }
        }

        debouncedCheckedWorkspacesChange(getWorkspaceId(updatedWorkspaces));
        return updatedWorkspaces;
      });
    },
    [workspaceData, debouncedCheckedWorkspacesChange]
  );

  return (
    <div className="p-1.5 pt-0 w-80 flex flex-col gap-1.5 mt-2">
      <div className="w-fit flex items-center bg-black text-white rounded h-[48px] hover:bg-transparent">
        <AddSchedule
          listId={""}
          enableEditing={function (): void {
            throw new Error("Function not implemented.");
          }}
          disableEditing={function (): void {
            throw new Error("Function not implemented.");
          }}
          isEditing={false}
          isGlobalCalendar={true}
          closeDialog={function (): void {}}
          openDialog={function (): void {}}
        />
      </div>
      <div className="mt-6">
        <div>
          {Object.keys(workspaceData).map((email) => (
            <div key={email}>
              <label className="flex gap-1 align-middle items-center">
                <Checkbox
                  checked={checkedEmails[email] || false}
                  onCheckedChange={() => handleEmailChange(email)}
                  color={"transparent"}
                />
                {email}
              </label>
              <div className="pl-6 flex flex-col gap-1">
                {workspaceData[email].map((workspace) => {
                  const colors =
                    workspaceDataTransformed[workspace.ID]?.lightColors ?? {};
                  return (
                    <label
                      className="flex gap-1 align-middle items-center"
                      key={workspace.ID}
                    >
                      <Checkbox
                        checked={checkedWorkspaces[workspace.ID] || false}
                        onCheckedChange={() =>
                          handleWorkspaceChange(workspace.ID)
                        }
                        color={colors.container}
                      />
                      {workspace.title}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarFilter;
