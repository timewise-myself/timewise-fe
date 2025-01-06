/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { ArchiveIcon, BookText, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Input } from "../ui/input";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface Props {
  data: any;
  document: any;
  disabled?: boolean;
}

//delete file document
export const deleteDocument = async (params: any, session: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/document/delete?scheduleId=${params.scheduleId}&fileName=${params.fileName}`,
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
  return await response.text();
};

const Document = ({ data, document }: Props) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const scheduleId = data.id;
  const wsId = data.workspace_id;
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const MAX_FILE_SIZE_MB = 10;
  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes >= 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  };
  const { mutate: deleteDocumentMutation } = useMutation({
    mutationFn: async (document: any) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(data.workspace_id)
      );

      const response = await deleteDocument(
        {
          scheduleId: document.schedule_id,
          fileName: document.file_name,
          organizationId: wsId,
          userEmail: userEmail?.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listBoardColumns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["detailCard"],
      });
      toast.success("Document removed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove document");
    },
  });

  const { mutate: uploadDocumentMutation } = useMutation({
    mutationFn: async () => {
      if (!file) return;

      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(data.workspace_id)
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("scheduleId", scheduleId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/document/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
            "X-User-Email": `${userEmail?.email}`,
            "X-Workspace-ID": `${wsId}`,
          },
          body: formData,
        }
      );
      return response.text();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
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
      queryClient.invalidateQueries({
        queryKey: ["detailCard"],
      });
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File size must be less than ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      setFile(event.target.files[0]);
      uploadDocumentMutation();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="flex items-center gap-x-2">
          <ArchiveIcon className="h-4 w-4 text-gray-400" />
          <p className="w-[100px]">Document</p>
        </div>
        <Input
          type="file"
          onChange={handleFileChange}
          className="border-none cursor-pointer p-0 h-5"
        />
      </div>
      <div className="flex flex-row space-x-4 overflow-auto ">
        {document?.map((document: any) => (
          <div
            key={document.id}
            className="relative flex p-4 items-center bg-white shadow rounded-lg border-solid border-2 border-gray-200"
          >
            <BookText className="h-6 w-6 text-orange-500" />
            <div className="flex flex-col flex-grow ml-2">
              <a
                href={document.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 font-semibold hover:cursor-pointer"
              >
                {document.file_name}
              </a>
              <span className="text-gray-400 text-sm">
                {document.file_size > 1024
                  ? `${formatFileSize(document.file_size)} * Download`
                  : `${document.file_size} B`}
              </span>
            </div>

            <Button
              onClick={() => deleteDocumentMutation(document)}
              className="top-[-8px] right-[-5px] ml-2 p-2 rounded-full border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 bg-transparent hover:bg-transparent absolute"
            >
              <X className="h-4 w-4 font-bold text-lg" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Document;
