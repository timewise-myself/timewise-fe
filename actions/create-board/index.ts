"use server";

import { InputType, ReturnType } from "./types";
import { CreateBoard } from "./schema";
import { createSafeAction } from "@/lib/create-safe-action";

const handler = async (data: InputType): Promise<ReturnType> => {
  // const userId = auth();

  // if (!userId) {
  //   return {
  //     error: "unauthorized",
  //   };
  // }

  const { title, image } = data;

  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split("|");
  console.log("create image ", [
    imageId,
    imageThumbUrl,
    imageFullUrl,
    imageLinkHTML,
    imageUserName,
  ]);

  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageLinkHTML ||
    !imageUserName
  ) {
    return {
      error: "Missing fields, Fail to create board",
    };
  }

  let board;
  //call api to create board
  try {
    const response = await fetch("https://api.example.com/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create board");
    }

    // Decode the JSON data
    board = await response.json();
  } catch (error) {
    return {
      error: "Failed to create board",
    };
  }
  return {
    data: {
      message: "Board created successfully",
      id: board.id,
    },
  };
};

export const createBoard = createSafeAction(CreateBoard, handler);
