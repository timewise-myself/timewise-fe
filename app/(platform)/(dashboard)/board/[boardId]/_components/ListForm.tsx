import { useParams } from "next/navigation";
import React, { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import ListWrapper from "./ListWrapper";
import { Plus, X } from "lucide-react";
import FormInput from "@/components/form/form-input";
import FormSubmit from "@/components/form/form-submit";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateList } from "@/actions/create-list/schema";
import { z } from "zod";
import {useStateContext} from "@/stores/StateContext";
import {getUserEmailByWorkspace} from "@/utils/userUtils";

const ListForm = () => {
  const { data: session } = useSession();

  const params = useParams();
  const workspaceId = Number(params.organizationId);

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const maxPosition = queryClient.getQueryData([
    "maxPosition",
    params.organizationId,
  ]) as number | undefined;

  const position = maxPosition !== undefined ? maxPosition + 1 : 1;

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateList>) => {
      const validatedFields = CreateList.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }

      const { name } = values;

      const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
      if (!userEmail) {
        return null;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.access_token}`,
            "X-User-Email": `${userEmail.email}`,
            "X-Workspace-ID": `${params.organizationId}`,
          },
          body: JSON.stringify({
            name,
            position: position,
            workspace_id: workspaceId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(`Column "${data.name}" created successfully`);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns", params.organizationId],
      });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to create column. Please try again."
      );
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    if (!title) {
      return;
    }

    mutate({ name: title });
    disableEditing();
  };

  if (isEditing) {
    return (
      <ListWrapper>
        <form
          action={handleSubmit}
          ref={formRef}
          className="w-full p-3 rounded-md bg-white space-y-4 shadow-md"
        >
          <FormInput
            ref={inputRef}
            id="title"
            placeholder="Enter List Title..."
            className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
          />
          <input hidden defaultValue={params.boardId} name="boardId" />
          <div className="flex items-center justify-between ">
            <FormSubmit>Add List</FormSubmit>
            <Button variant={"ghost"} size={"sm"} onClick={disableEditing}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <button
        onClick={enableEditing}
        className="w-full rounded0md bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a board
      </button>
    </ListWrapper>
  );
};

export default ListForm;
