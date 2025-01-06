/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, {
  ElementRef,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useParams } from "next/navigation";
import { updateCardID } from "@/lib/fetcher";
import { Form } from "../ui/form";
import { UpdateCard } from "@/actions/update-card/schema";
import { format, parseISO } from "date-fns";
import { CircleDot } from "lucide-react";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";
import { StatusConst } from "@/constants/general";

interface Props {
  data: any;
  disabled?: boolean;
}

const Status = ({ data, disabled }: Props) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(data.status);
  const formRef = useRef<HTMLFormElement>(null);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const form = useForm<z.infer<typeof UpdateCard>>({
    resolver: zodResolver(UpdateCard),
    defaultValues: {
      status: data.status,
      start_time: format(parseISO(data.start_time), "yyyy-MM-dd HH:mm:ss.SSS"),
      end_time: format(parseISO(data.end_time), "yyyy-MM-dd HH:mm:ss.SSS"),
    },
  });

  const { mutate: updateCardInformation } = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateCard>) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || data.workspace_id)
      );
      if (!userEmail) {
        return null;
      }
      const response = await updateCardID(
        {
          cardId: data.id,
          visibility: values.visibility,
          all_day: values.all_day,
          description: values.description,
          end_time: format(
            new Date(values.end_time),
            "yyyy-MM-dd HH:mm:ss.SSS"
          ),
          extra_data: values.extra_data,
          location: values.location,
          priority: values.priority,
          recurrence_pattern: values.recurrence_pattern,
          start_time: format(
            new Date(values.start_time),
            "yyyy-MM-dd HH:mm:ss.SSS"
          ),
          status: values.status,
          title: values.title,
          organizationId: params.organizationId || data.workspace_id,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detailCard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules", data.workspace_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
      startTransition(() => {
        reset();
      });
      toast.success("Status updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { register, reset, setValue } = form;

  const enableEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => {});
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setValue("status", newStatus);

    updateCardInformation({
      ...form.getValues(),
      status: newStatus,
    });
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(closeRef, () => {
    if (!isPending) {
      disableEditing();
    }
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderStatusContent = () => (
    <div className="flex items-center flex-row gap-x-2">
      <CircleDot className="w-4 h-4 text-gray-400" />
      <p className="text-gray-400 w-[100px]">Status</p>
      {isEditing ? (
        <select
          {...register("status")}
          onChange={handleSelectChange}
          value={data.status}
          disabled={isPending}
        >
          <option value="not yet">Not Yet</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      ) : (
        <p onClick={enableEditing}>
          {status ? StatusConst[status as keyof typeof StatusConst] : "Pending"}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Form {...form}>
        {isEditing ? (
          <form ref={formRef} className="flex flex-row gap-x-1 pt-2">
            {renderStatusContent()}
          </form>
        ) : (
          <div className="flex flex-row items-center gap-x-2 cursor-pointer pt-2">
            {renderStatusContent()}
          </div>
        )}
      </Form>
    </>
  );
};

export default Status;
