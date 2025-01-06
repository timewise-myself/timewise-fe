/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import FormSubmit from "@/components/form/form-submit";
import {Button} from "@/components/ui/Button";
import {Popover, PopoverClose, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Separator} from "@/components/ui/separator";
import {List} from "@/types/Board";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {MoreHorizontal, X} from "lucide-react";
import {useSession} from "next-auth/react";
import React, {ElementRef, useRef} from "react";
import {toast} from "sonner";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
    data: List;
    onAddCard: () => void;
}

export const deleteListBoardColumns = async (params: any, session: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/board_columns/${params.boardId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session?.user.access_token}`,
                "X-User-Email": `${params.userEmail}`,
                "X-Workspace-ID": `${params.organizationId}`,
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    return data;
};

const ListOptions = ({data, onAddCard}: Props) => {
    const closeRef = useRef<ElementRef<"button">>(null);
    const {data: session} = useSession();
    const queryClient = useQueryClient();
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();

    const {mutate: deleteBoardColumn} = useMutation({
        mutationFn: async () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(data.workspace_id));
            if (!userEmail) {
                return null;
            }
            const response = await deleteListBoardColumns(
                {
                    boardId: data.id,
                    organizationId: data.workspace_id,
                    userEmail: userEmail.email,
                },
                session
            );
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["listBoardColumns"],
            });
            toast.success("Board deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete comment");
        },
    });

    const onDelete = (e: React.FormEvent) => {
        e.preventDefault();
        deleteBoardColumn();
        closeRef.current?.click();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"ghost"} className="h-auto w-auto p-2">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align={"start"} className="px-0 py-3 ">
                <div className="text-sm font-medium text-center text-neutral-600 pb-4">
                    List Actions
                </div>
                <PopoverClose ref={closeRef} asChild>
                    <Button
                        variant={"ghost"}
                        className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
                    >
                        <X className="h-4 w-4"/>
                    </Button>
                </PopoverClose>
                <Button
                    onClick={onAddCard}
                    variant={"ghost"}
                    className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm"
                >
                    Add new schedule
                </Button>
                <Separator className="bg-neutral-500 "/>
                <form
                    onSubmit={onDelete}
                    className="space-y-2 w-full h-auto p-2 px-5 justify-start font-normal text-sm"
                >
                    <input hidden name="id" id="id" value={data.id}/>
                    <input hidden name="boardId" id="boardId" value={data.id}/>
                    <FormSubmit
                        variant="ghost"
                        className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm"
                    >
                        Delete this board
                    </FormSubmit>
                </form>
            </PopoverContent>
        </Popover>
    );
};

export default ListOptions;
