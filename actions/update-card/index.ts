"use server";

import { InputType, ReturnType } from "./types";
import { UpdateCard } from "./schema";
import { createSafeAction } from "@/lib/create-safe-action";

const handler = async (data: InputType): Promise<ReturnType> => {
  let card;

  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);
