import * as z from "zod";

export const UpdateCardOrder = z.object({
  board_column_id: z.number(),
  position: z.number(),
  cardId: z.number(),
});

