"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  // const userId = auth();
  // if (!userId) {
  //   return {
  //     error: "unauthorized",
  //   };
  // }

  let board;

  return {
    data: board,
  };
};

export default createSafeAction(UpdateBoard, handler);
