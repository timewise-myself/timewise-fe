import { notFound } from "next/navigation";
import React from "react";
import BoardNavbar from "./_components/BoardNavbar";
import { BOARD_DATA } from "@/test/fake-board-data";

const BoardIdLayout = async ({ children }: { children: React.ReactNode }) => {
  // const {orgId} = auth();

  // if (!orgId) {
  //   redirect("/select-org");
  // }

  //fetch board data
  const board = BOARD_DATA[0];

  if (!board) {
    notFound();
  }

  return (
    <div
      className="relative h-full bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${board.imageFullUrl})`,
      }}
    >
      <BoardNavbar data={board} />
      <div className="absolute inset-0 bg-black/30"></div>
      <main className="relative pt-28 h-full">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
