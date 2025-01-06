"use server";

import { LinkEmail } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";

const handler = async (data: InputType): Promise<ReturnType> => {
  //   const { userId, orgId } = auth();

  //   if (!userId || !orgId) {
  //     return {
  //       error: "Unauthorized!",
  //     };
  //   }

  // const { id, boardId } = data;
  // let lists;

  //   //fetch API to update list order
  try {
    //api update board
    const response = await fetch(`https://api.example.com/boards/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  } catch (error) {
    return {
      error: "Failed to update board",
    };
  }

  //   revalidatePath(`/board/${boardId}}`);
  return {};
};

export const createCard = createSafeAction(LinkEmail, handler);
