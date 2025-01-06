import { z } from "zod";

export const CreateComment = z.object({
  content: z.string().min(1, "Please enter a comment"),
});
