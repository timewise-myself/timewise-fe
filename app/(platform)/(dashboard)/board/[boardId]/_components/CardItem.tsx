import { useCardModal } from "@/hooks/useCardModal";
import { Card, Workspace } from "@/types/Board";
import React from "react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Draggable } from "@hello-pangea/dnd";
import { Link, Lock, MessageCircle, Tv } from "lucide-react";
import { truncateText } from "@/utils";
import { checkSchedulePermission, ScheduleAction } from "@/constants/roles";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";
import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceDetails } from "@/lib/fetcher";
import { useSession } from "next-auth/react";

interface Props {
  data: Card;
  index: number;
  isBlurred?: boolean;
}

const getRandomColor = () => {
  const colors = [
    "bg-red-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-indigo-100",
    "bg-purple-100",
    "bg-pink-100",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CardItem = ({ data, index, isBlurred }: Props) => {
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();
  const { data: session } = useSession();

  const cardModal = useCardModal();
  if (!data.id) {
    return null;
  }

  const { data: workspaceInfo, isLoading } = useQuery<Workspace>({
    queryKey: ["workspaceDetails"],
    queryFn: async () => {
      return await fetchWorkspaceDetails(data.workspace_id, session);
    },
    enabled: !!session && !!data,
  });

  // todo: locked drag and drop for cards
  const userEmail = getUserEmailByWorkspace(
    stateUserEmails,
    stateWorkspacesByEmail,
    Number(data.workspace_id)
  );
  const currentScheduleRole = data.schedule_participants?.find(
    (participant) => participant.email === userEmail?.email
  )?.status;
  const isAllowUpdatePosition = () => {};

  return (
    <>
      <Draggable draggableId={data.id.toString()} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            onClick={() => {
              if (data.extra_data !== "IsLocked") {
                cardModal.onOpen(data.id.toString());
              }
            }}
            className={`flex flex-col gap-[2px] h-[150px] truncate border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-md 
            ${isBlurred && "opacity-50"}`}
          >
            <div className="flex justify-between items-center">
              {data.title && (
                <span
                  className={`w-fit px-2 py-1 leading-tight inline-flex items-center ${getRandomColor()} rounded`}
                >
                  <Tv className="w-4 h-4" />
                  <span className={"text-sm ml-2 font-bold text-teal-900"}>
                    {"Board"}
                  </span>
                </span>
              )}
              {isBlurred && <Lock className="w-5 h-5" />}
            </div>
            <div className="text-lg font-bold">
              {truncateText(data.title, 20)}
            </div>
            <div className="text-sm font-light text-gray-400">
              {data.description.length > 32
                ? `${data.description.substring(0, 32)}...`
                : data.description}
            </div>
            <Separator className="my-2" />
            <div className="text-black text-muted-foreground text-xs">
              <div className="flex flex-row justify-between">
                <span
                  className={
                    "flex flex-row -ml-2 rounded-full border-2 border-white"
                  }
                >
                  {data.schedule_participants
                    ?.slice(0, 3)
                    .map((participant, index) => (
                      <Image
                        key={index}
                        src={participant.profile_picture}
                        alt={"avatar"}
                        width={20}
                        height={20}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    ))}
                  {data.schedule_participants &&
                    data.schedule_participants?.length > 3 && (
                      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-black text-xs text-white  border-2 border-white">
                        +{data.schedule_participants.length - 3}
                      </span>
                    )}
                </span>

                <div className="flex items-center gap-x-2">
                  <Link className="w-4 h-4" />
                  {data.documents_count > 0 ? data.documents_count : 0}{" "}
                  <MessageCircle className="w-4 h-4" />
                  {data.comments_count > 0 ? data.comments_count : 0}{" "}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
};

export default CardItem;
