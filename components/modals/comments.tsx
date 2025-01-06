/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { Comment } from "@/types/Board";
import { CreateComment } from "@/actions/create-comment/schema";
import { Pencil, Trash2 } from "lucide-react";
import { addComment, deleteComment, editComment } from "@/lib/fetcher";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface Props {
  session: any;
  data: Comment[];
  scheduleId: string | undefined;
  workspaceId: number;
}

const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

const Comments = ({ session, data, scheduleId, workspaceId }: Props) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const id = Number(scheduleId);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const [isEditingComment, setIsEditingComment] = useState(false);

  const form = useForm<z.infer<typeof CreateComment>>({
    resolver: zodResolver(CreateComment),
    defaultValues: {
      content: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;

  const { mutate: addCommentMutation } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateComment>) => {
      const validatedFields = CreateComment.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }

      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || workspaceId)
      );
      if (!userEmail) {
        return null;
      }

      const response = await addComment(
        {
          content: values.content,
          schedule_id: id,
          organizationId: params.organizationId || workspaceId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns"],
      });
      startTransition(() => {
        reset();
      });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  const { mutate: deleteCommentMutation } = useMutation({
    mutationFn: async (commentId: number) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(workspaceId)
      );
      if (!userEmail) {
        return null;
      }
      const response = await deleteComment(
        {
          commentId,
          organizationId: params.organizationId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const { mutate: editCommentMutation } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateComment>) => {
      const validatedFields = CreateComment.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }

      if (editingCommentId === null) {
        throw new Error("Comment ID is undefined");
      }

      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId || workspaceId)
      );
      if (!userEmail) {
        return null;
      }

      const response = await editComment(
        {
          commentId: editingCommentId,
          content: values.content,
          schedule_id: id,
          organizationId: params.organizationId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listComments"],
      });
      startTransition(() => {
        reset();
        setEditingCommentId(null);
      });
      toast.success("Comment edited successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to edit comment");
    },
  });

  const handleSubmission = handleSubmit((values) => {
    if (editingCommentId !== null) {
      editCommentMutation(values);
    } else {
      addCommentMutation(values);
    }
  });

  const handleDelete = (commentId: number) => {
    deleteCommentMutation(commentId);
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setValue("content", content);
  };

  return (
    <div className="space-y-2 w-full ">
      <div className="flex flex-row items-center gap-x-2 w-full ">
        <Image
          src={session?.user?.picture}
          alt="avatar"
          width={40}
          height={40}
          className="h-6 w-6 rounded-full object-cover"
        />
        <form
          onSubmit={handleSubmission}
          className="flex-grow flex flex-row gap-x-1 w-full"
        >
          <div className="flex items-center flex-col w-full">
            <Input
              type="text"
              disabled={isPending}
              placeholder="Add a comment..."
              className="w-full p-2 border border-gray-300 rounded-md"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>
          <Button className="w-fit" type="submit">
            Comment
          </Button>
        </form>
      </div>
      <div className="overflow-auto space-y-2">
        {data && data.length > 0 ? (
          data.map((comment: Comment) => (
            <div
              className="flex flex-col p-2 bg-sky-50 rounded-lg"
              key={comment.ID}
            >
              <div className="flex flex-row items-center gap-x-1 justify-start space-x-1">
                <Image
                  src={comment.profile_picture}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="h-4 w-4 rounded-full object-cover"
                />
                <p className="font-bold text-sm">
                  {comment.first_name}
                  {truncateName(comment.last_name, 10)}
                </p>
                <p>-</p>
                <p>{format(new Date(comment.created_at), "dd/MM/yyyy")}</p>
                {session?.user?.email === comment?.email && (
                  <>
                    <div
                      className="hover:bg-sky-50 bg-transparent cursor-pointer flex items-center gap-x-1"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(comment.ID, comment.content);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </div>
                    {editingCommentId !== comment.ID && (
                      <div
                        className="hover:bg-sky-50 bg-transparent cursor-pointer flex items-center gap-x-1"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(comment.ID);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </>
                )}
                {comment.updated_at !== comment.created_at && (
                    <p className="text-xs text-gray-500">Edited</p>
                )}
              </div>
              <p className="pl-6 text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="w-full justify-center flex items-center m-auto">
            No comments available
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments;
