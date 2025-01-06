/* eslint-disable @typescript-eslint/no-explicit-any */

import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {format, parseISO} from "date-fns";
import {Plus, UserRound, X} from "lucide-react";
import {useSession} from "next-auth/react";
import {useParams} from "next/navigation";
import React, {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";
import {Form} from "../ui/form";
import {Input} from "../ui/input";
import {Button} from "../ui/Button";
import {addPersonalReminder, removePersonalReminder, updateReminderPersonal,} from "@/lib/fetcher";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
  data: any;
  schedule: any;
  disabled?: boolean;
}

export const PersonReminder = z.object({
  time: z.string().refine(
    (val) => {
      const reminderTime = new Date(val);
      const currentDate = new Date();
      if (reminderTime < currentDate) {
        return false;
      }
      return true;
    },
    {
      message:
        "Reminder time must be greater than or equal to the current time",
    }
  ),
});

const PersonalReminder = ({ data, schedule, disabled }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { stateWorkspacesByEmail, stateUserEmails } = useStateContext();
  const [reminderTime, setReminderTime] = useState(
    data?.reminder_time
      ? format(parseISO(data.reminder_time), "yyyy-MM-dd HH:mm")
      : ""
  );

  const form = useForm({
    resolver: zodResolver(PersonReminder),
    defaultValues: {
      ...data,
      time: reminderTime,
    },
  });

  const handleAddReminder = () => {
    addReminderPersonalMutation.mutate();
  };

  const addReminderPersonalMutation = useMutation({
    mutationFn: async () => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || data.workspaceId)
      );
      if (!userEmail) {
        return null;
      }

      const response = await addPersonalReminder(
        {
          schedule_id: schedule.id,
          organizationId: params.organizationId || data.workspaceId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalReminder"],
      });
      toast.success("Reminder added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add reminder");
    },
  });

  const { register, handleSubmit } = form;

  const { mutate: updateReminderPersonalMutate } = useMutation({
    mutationFn: async (values: z.infer<typeof PersonReminder>) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || data.workspaceId)
      );
      if (!userEmail) {
        return null;
      }

      const updateTime = new Date(values.time);
      // Subtract 7 hours
      updateTime.setHours(updateTime.getHours() - 7);

      const response = await updateReminderPersonal(
        {
          reminder_id: data.ID,
          time: format(updateTime, "yyyy-MM-dd HH:mm"),
          schedule_id: data.schedule_id,
          organizationId: params.organizationId || data.workspaceId,
          userEmail: userEmail.email,
        },
        session
      );

      return response;
    },
    onSuccess: () => {
      startTransition(() => {
        setIsEditing(false);
      });
      queryClient.invalidateQueries({
        queryKey: ["personalReminder"],
      });

      toast.success("Personal reminder updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const { mutate: removePersonalReminderMutate } = useMutation({
    mutationFn: async () => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || data.workspaceId)
      );
      if (!userEmail) {
        return null;
      }
      return await removePersonalReminder(
        {
          reminder_id: data.ID,
          schedule_id: data.schedule_id,
          organizationId: params.organizationId || data.workspaceId,
          userEmail: userEmail.email,
        },
        session
      );
    },
    onSuccess: () => {
      startTransition(() => {
        setIsEditing(false);
      });
      queryClient.invalidateQueries({
        queryKey: ["personalReminder"],
      });

      toast.success("Personal reminder removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmission = handleSubmit((values) => {
    updateReminderPersonalMutate(values);
  });

  const renderPersonalReminderContent = () => (
  <div className="flex items-center ml-6 mt-1">
    <UserRound className="h-4 w-4 mr-2 text-gray-400" />
    <p className="text-md text-gray-400 w-[100px]">Personal</p>
    <Input
      id="time"
      value={reminderTime}
      disabled={isPending}
      defaultValue={reminderTime}
      type="datetime-local"
      {...register("time")}
      onChange={(e) => setReminderTime(e.target.value)}
      className="px-1 w-50 mr-1"
    />
    <Button onClick={handleSubmission}>Change</Button>
  </div>
);

return (
  <>
    <Form {...form}>
      {isEditing ? (
        <form>
          {renderPersonalReminderContent()}
        </form>
      ) : (
        <div className="flex items-center">
          {data && !data.message ? (
            <div className="flex flex-row items-center ml-6 mt-1">
              <UserRound className="h-4 w-4 mr-2 text-gray-400" />
              <p className="text-md text-gray-400 w-[85px]">Personal</p>
              <p className="text-md" onClick={() => {
                if (disabled) return;
                setIsEditing(true);
              }}>
                {data.reminder_time
                  ? format(new Date(data.reminder_time), "dd-MM-yyyy HH:mm")
                  : "No reminder set"}
              </p>
            </div>
          ) : (
            <div className="flex flex-row items-center ml-6 mt-1">
              <UserRound className="h-4 w-4 mr-2 text-gray-400" />
              <p className="text-md text-gray-400 w-[85px]">Personal</p>
              <Button
                className="bg-transparent hover:bg-transparent text-black p-0 text-gray-400"
                onClick={handleAddReminder}
              >
                <Plus className={"w-4 h-4 mr-1"} />
                Add personal reminder
              </Button>
            </div>
          )}

          {data && !data.message && (
            <div className="ml-1 flex flex-row items-center gap-x-2 cursor-pointer mt-1">
              <X
                className="w-4 h-4 text-gray-400"
                onClick={() => removePersonalReminderMutate()}
              />
            </div>
          )}
        </div>
      )}
    </Form>
  </>
);
};

export default PersonalReminder;
