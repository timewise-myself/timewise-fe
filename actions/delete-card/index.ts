"use server";

import { InputType, ReturnType } from "./types";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteCard } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  // const { userId, orgId } = auth();

  // if (!userId || !orgId) {
  //   return {
  //     error: "Unauthorized!",
  //   };
  // }

  const { id, boardId, ...values } = data;

  let card;

  // try {
  //   card = await db.card.update({
  //     where: {
  //       id,
  //       list: {
  //         board: {
  //           orgId,
  //         },
  //       },
  //     },
  //     data: {
  //       ...values,
  //     },
  //   });

  // await createAuditLog({
  //   entityTitle: card.title,
  //   entityId: card.id,
  //   entityType: ENTITY_TYPE.CARD,
  //   action: ACTION.UPDATE,
  // });
  // } catch (error) {
  //   return {
  //     error: "Failed to Update the Card!",
  //   };
  // }

  revalidatePath(`/board/${id}`);
  return { data: card };
};

export const deleteCard = createSafeAction(DeleteCard, handler);
