import { CardWithList } from "@/types/Board";
import React, { useRef, useState, useTransition } from "react";
import { Skeleton } from "../ui/skeleton";
import { UpdateCard } from "@/actions/update-card/schema";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { updateCardID } from "@/lib/fetcher";
import { format } from "date-fns";
import { truncateText } from "@/utils";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface Props {
  data: CardWithList;
}

const Header = ({ data }: Props) => {
  const [title, setTitle] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const form = useForm<z.infer<typeof UpdateCard>>({
    resolver: zodResolver(UpdateCard),
    defaultValues: {
      ...data,
    },
  });

  const { mutate: updateCardInformation } = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateCard>) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || data.workspace_id)
      );
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
          userEmail: userEmail?.email,
        },
        session
      );
      return response;
    },
    onSuccess: (data) => {
      setTitle(data.title);
      startTransition(() => {
        setIsEditing(false);
      });
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

      toast.success("Schedule updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.handleSubmit((values) => updateCardInformation(values))();
    }
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleSubmission = handleSubmit((values) => {
    updateCardInformation(values);
  });

  return (
    <div className="flex items-start w-full">
      <div className="w-full space-y-3">
        <Form {...form}>
          {isEditing ? (
            <>
              <form
                className="flex flex-col items-start gap-x-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmission();
                }}
              >
                <Input
                  id="title"
                  disabled={isPending}
                  onFocus={enableEditing}
                  defaultValue={title}
                  onKeyDown={handleEnterPress}
                  {...register("title")}
                  className=" font-semibold text-[20px] px-1 text-neutral-700 bg-transparent border-transparent relative left-1.5 w-[95%] focus-visible:bg-white focus-visible:border-input mb-0.5 truncate"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm items-start">
                    {errors.title.message}
                  </p>
                )}
                <button type="submit" />
              </form>
            </>
          ) : (
            <div
              onClick={enableEditing}
              className=" flex flex-row items-center w-full text-[25px] font-bold border-transparent leading-none"
            >
              {truncateText(data.title, 30)}
            </div>
          )}
        </Form>
        {/*<p className=" text-md text-muted-foreground">*/}
        {/*  In List{" "}*/}
        {/*  <span className="underline"> {truncateText(data.title, 30)}</span>*/}
        {/*</p>*/}
      </div>
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex-items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 ,t-1 bg-neutral-200" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};

export default Header;
