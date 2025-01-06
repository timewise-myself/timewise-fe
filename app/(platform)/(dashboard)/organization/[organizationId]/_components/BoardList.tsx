import FormPopOver from "@/components/form/form-popover";
import HintTool from "@/components/hint-tool";
import { Skeleton } from "@/components/ui/skeleton";
import { BOARD_DATA } from "@/test/fake-board-data";
import { HelpCircle, User2 } from "lucide-react";
import Link from "next/link";
import React from "react";
/*import InviteMember from "./InviteMember";*/

const BoardList = () => {
  //get session from server
 
  //fetch board data
  const boards = BOARD_DATA;

  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-neutral-700 text-lg">
        <User2 className="h-6 w-6 mr-2" />
        Board
      </div>
      {/*<InviteMember />*/}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <Link
            href={`/board/${board.id}`}
            key={board.id}
            className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden"
            style={{ backgroundImage: `url(${board.imageFullUrl})` }}
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition">
              <p className="relative font-semibold text-white">{board.title}</p>
            </div>
          </Link>
        ))}
        <FormPopOver sideOffset={10} side="right">
          <div
            role="button"
            className="aspect-video relative w-full h-20 max-h-full bg-muted
            rounded-sm flex flex-col gap-y-1 items-center
            justify-center hover:opacity-75 transition
            "
          >
            <div className="text-neutral-700 text-sm font-semibold px-2">
              Create New
            </div>
            <HintTool sideOffSet={40} description="Free organnization">
              <HelpCircle className="absolute bottom-2 right-2 h-[14px] w-[14px]" />
            </HintTool>
          </div>
        </FormPopOver>
      </div>
    </div>
  );
};

export default BoardList;

BoardList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
    </div>
  );
};
