import React, {
  ElementRef,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { CardWithList } from "@/types/Board";
import { AlignLeft } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateCard } from "@/actions/update-card/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { updateCardID } from "@/lib/fetcher";
import { toast } from "sonner";
import { format } from "date-fns";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";
import { Form } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/Button";

interface Props {
  data: CardWithList;
  disabled: boolean;
}

const Description = ({ data, disabled }: Props) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const [description, setDescription] = useState(data.description);
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
      setDescription(data.description);
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

  const {
    register,
    formState: { errors },
  } = form;

  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmission = form.handleSubmit((values) => {
    updateCardInformation(values);
  });

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.handleSubmit((values) => updateCardInformation(values))();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [description]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="gap-x-3 w-full">
      <div className="flex items-center gap-2">
        <AlignLeft className="h-4 w-4 text-gray-400" />
        <p className="text-gray-400">Description</p>
      </div>
      <div className="w-full mt-1">
        <Form {...form}>
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmission();
              }}
              ref={formRef}
              className="space-y-2"
            >
              <Textarea
                id="description"
                disabled={isPending || disabled}
                onFocus={enableEditing}
                className="min-h-[78px] w-full"
                placeholder="Add a more detailed description..."
                defaultValue={description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm items-start">
                  {errors.description.message}
                </p>
              )}
              <Button type="submit" className="btn-primary">
                Submit
              </Button>
            </form>
          ) : (
            <div
              onClick={enableEditing}
              role="button"
              className="min-h-[78px] bg-neutral-200 text-s, font-medium p-1 rounded-md"
            >
              <Textarea
                  id="description"
                  disabled={isPending || disabled}
                  onFocus={enableEditing}
                  className="min-h-[78px] w-full"
                  placeholder="Add a more detailed description..."
                  defaultValue={description}
                  {...register("description")}
                  ref={textareaRef}
                  onInput={adjustTextareaHeight}
              />
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="h-6 w-24 mb-2 bg-neutral-200" />
        <Skeleton className="h-[78px] w-full bg-neutral-200" />
      </div>
    </div>
  );
};
export default Description;
