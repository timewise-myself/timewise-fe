/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { ElementRef, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import ListOptions from "./ListOptions";
import { List } from "@/types/Board";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Mailbox } from "lucide-react";
import { UpdateBoard } from "@/actions/update-board/schema";
import { z } from "zod";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { updateListBoardColumns } from "@/lib/fetcher";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface Props {
  data: List;
  onAddCard: () => void;
}

const ListHeader = ({ data, onAddCard }: Props) => {
  const { data: session } = useSession();
  const params = useParams();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [isPending, startTransition] = useTransition();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const [title, setTitle] = useState(data.name);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const workspaceId = Number(params.organizationId);

  const form = useForm<z.infer<typeof UpdateBoard>>({
    resolver: zodResolver(UpdateBoard),
    defaultValues: {
      name: title,
    },
  });

  const { mutate: updateBoardInformation } = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateBoard>) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        workspaceId
      );

      const response = await updateListBoardColumns(
        {
          listId: data.id,
          organizationId: workspaceId,
          name: values.name,
          userEmail: userEmail?.email,
        },
        session
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listBoardColumns"] });
      setTitle(data.title);
      startTransition(() => {
        setIsEditing(false);
      });
      toast.success("Board column updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
    document.addEventListener("click", handleClickOutside, true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const inputElement = document.getElementById("title");
    if (event.target !== inputElement) {
      disableEditing();
      document.removeEventListener("click", handleClickOutside, true);
    }
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.handleSubmit((values) => updateBoardInformation(values))();
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const disableEditing = () => {
    setIsEditing(false);
    if (inputRef.current && inputRef.current.value !== title) {
      setTitle(inputRef.current.value);
    }
  };

  const handleSubmission = handleSubmit((values) => {
    updateBoardInformation(values);
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);

  return (
    <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
      <Form {...form}>
        {isEditing ? (
          <>
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmission();
              }}
              className="flex-1 px-[2px]"
            >
              <input hidden id="id" name="id" value={data.id} />
              <input hidden id="listId" name="listId" value={data.id} />
              <Input
                id="title"
                placeholder="Enter list title..."
                defaultValue={title}
                onFocus={enableEditing}
                disabled={isPending}
                {...register("name")}
                onKeyDown={handleEnterPress}
                className="text-sm px-[7px] py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
              />
              {errors.name && (
                <p className="text-red-500 text-sm items-start">
                  {errors.name.message}
                </p>
              )}
              <button type="submit" />
            </form>
          </>
        ) : (
          <div
            onClick={enableEditing}
            className="flex flex-row items-center w-full text-sm px-2.5 py-1 h-7 font-bold border-transparent"
          >
            <Mailbox className="h-4 w-4 mr-2" />
            {data.name}
          </div>
        )}
      </Form>

      <ListOptions data={data} onAddCard={onAddCard} />
    </div>
  );
};

export default ListHeader;
