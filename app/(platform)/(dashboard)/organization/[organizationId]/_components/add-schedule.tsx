/* eslint-disable @typescript-eslint/no-explicit-any */

import CustomDialog from "@/components/custom-dialog";
import {Form} from "@/components/ui/form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {useParams} from "next/navigation";
import React, {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {toast} from "sonner";
import FormSubmit from "@/components/form/form-submit";
import {Input} from "@/components/ui/input";
import {CreateCard} from "@/actions/create-card/schema";
import {ListWithCards, Workspace} from "@/types/Board";
import {Label} from "@/components/ui/label";
import {useStateContext} from "@/stores/StateContext";
import {getUserEmailByWorkspace} from "@/utils/userUtils";

interface Props {
  listId: string;
  enableEditing: () => void;
  disableEditing: () => void;
  isEditing: boolean;
  isGlobalCalendar: boolean;
  boardId?: string;
  closeDialog: () => void;
  openDialog: () => void;
}

export const getBoardByWsId = async (params: any, session: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns/workspace_id/${params.workspace_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.user.access_token}`,
        "X-User-Email": `${params.userEmail}`,
        "X-Workspace-ID": `${params.workspace_id}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

const AddSchedule = ({
  listId,
  isGlobalCalendar,
  closeDialog,
  openDialog,
}: Props) => {
  const { data: session } = useSession();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const workspaceId = Number(params.organizationId);
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
    string | undefined
  >(undefined);
  const [selectedBoardColumnId, setSelectedBoardColumnId] = useState<
    string | undefined
  >(undefined);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpenDialog = () => {
  //   openDialog();
  //   setIsOpen(true);
  // };
  const handleCloseDialog = () => {
    setIsOpen(false);
    closeDialog();
  };

  const handleWorkspaceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedWorkspaceId(event.target.value);
  };

  const handleBoardColumnChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBoardColumnId(event.target.value);
  };

  const form = useForm<z.infer<typeof CreateCard>>({
    resolver: zodResolver(CreateCard),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const fetchWorkspaces = async (email: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/get-workspaces-by-email/${email}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.user.access_token}`,
        },
      }
    );
    const data = await response.json();
    return data.map((workspace: Workspace) => workspace);
  };

  const { data: wsByEmail } = useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: async () => {
        return Object.entries(stateWorkspacesByEmail).flatMap(([mail, wsps]) =>
          wsps.map((ws: any) => ({
            ...ws,
            label: `${mail} - ${ws.title}`,
          }))
        ).sort((a: any, b: any) => a.label.localeCompare(b.label));
    },
    enabled: !!session,
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = form;

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateCard>) => {
      const validatedFields = CreateCard.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }
      const { title, description } = values;

      const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(selectedWorkspaceId || params.organizationId));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/schedules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.access_token}`,
            "X-User-Email": `${userEmail?.email}`,
            "X-Workspace-ID": `${selectedWorkspaceId || params.organizationId}`,
          },
          body: JSON.stringify({
            board_column_id: Number(selectedBoardColumnId) || listId,
            description: description,
            title: title,
            workspace_id: Number(selectedWorkspaceId) || workspaceId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success(`Schedule created successfully`);
      reset();
      handleCloseDialog();
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns", params.organizationId],
      });
      queryClient.invalidateQueries({queryKey: ["schedules"]});
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to create schedule. Please try again."
      );
    },

    onMutate: async (newListData) => {
      await queryClient.cancelQueries({
        queryKey: ["listBoardColumns", params.organizationId],
      });

      const previousListBoardColumns = queryClient.getQueryData([
        "listBoardColumns",
        params.organizationId,
      ]);

      queryClient.setQueryData(
        ["listBoardColumns", params.organizationId],
        (old: ListWithCards[] | undefined) => {
          if (Array.isArray(old)) {
            return [...old, newListData];
          } else {
            return [newListData];
          }
        }
      );

      return { previousListBoardColumns };
    },
  });

  const { data: listBoard } = useQuery({
    queryKey: ["listBoard", selectedWorkspaceId],
    queryFn: async () => {
      if (selectedWorkspaceId) {
        const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(selectedWorkspaceId || params.organizationId));
        return await getBoardByWsId(
          { workspace_id: selectedWorkspaceId, userEmail: userEmail?.email },
          session
        );
      }
    },
    enabled: !!selectedWorkspaceId && !!session,
  });

  const handleSubmission = handleSubmit((values) => {
    startTransition(() => {
      mutate(values);
    });
  });

  return (
    <div onClick={openDialog} className="cursor-pointer">
      <CustomDialog
        title={"Add new schedule"}
        description={
          "Create a new schedule and assign it to a specific board column."
        }
        btnSubmitContent="Create"
        btnContentIcon={"Add new schedule"}
        onClose={handleCloseDialog}
      >
        <Form {...form}>
          <form onSubmit={handleSubmission}>
            <div className="flex flex-col w-full space-y-2">
              <div className="flex flex-col items-start justify-between space-y-2">
                <Label className="font-bold mb-2" htmlFor="title">
                  Title
                </Label>
                <Input
                  disabled={isPending}
                  id="title"
                  placeholder="Enter title for this schedule"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}
              </div>
              <div className="flex flex-col items-start justify-between ">
                <Label className="font-bold mb-2" htmlFor="description">
                  Description
                </Label>
                <Input
                  disabled={isPending}
                  id="description"
                  placeholder="Enter description for this schedule"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {isGlobalCalendar && (
                <div className="flex flex-col items-start justify-between space-y-2">
                  <Label className="font-bold mb-2" htmlFor="email">
                    Select workspace
                  </Label>
                  <select
                    onChange={handleWorkspaceChange}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select workspace</option>
                    {wsByEmail?.map((workspace: Workspace) => (
                      <option key={workspace.ID} value={workspace.ID}>
                        {workspace.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isGlobalCalendar && (
                <div className="flex flex-col items-start justify-between space-y-2">
                  <Label className="font-bold mb-2" htmlFor="workspace">
                    Select Board Bolumn
                  </Label>
                  <select
                    onChange={handleBoardColumnChange}
                    disabled={!selectedWorkspaceId || isPending}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select board column</option>
                    {listBoard?.map((board: any) => (
                      <option key={board.ID} value={board.ID}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <FormSubmit className="w-full mt-5">Add the schedule</FormSubmit>
          </form>
        </Form>
      </CustomDialog>
    </div>
  );
};

export default AddSchedule;
