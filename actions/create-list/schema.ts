import { z } from "zod";

export const CreateList = z.object({
  name: z
    .string({
      required_error: "Title is required!",
      invalid_type_error: "Title is required!",
    })
    .min(3, {
      message: "Title is too short!",
    }),
});
