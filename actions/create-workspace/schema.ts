import { z } from "zod";

export const CreateWorkspace = z.object({
  title: z
    .string({
      required_error: "Title is required!",
      invalid_type_error: "Title is required!",
    })
    .min(3, {
      message: "Title is too short (must > 3 characters)!",
    })
      .max(20, {
          message: "Title is too long (must < 20 characters)!",
      }),
  description: z
    .string({
      required_error: "Description is required!",
      invalid_type_error: "Description is required!",
    })
    .min(3, {
      message: "Description is too short (must > 3 characters)!",
    })
      .max(50, {
          message: "Title is too long (must < 50 characters)!",
      }),
  email: z.string({
    required_error: "Email is required!",
    invalid_type_error: "Email is required!",
  })
      .min(3, {
          message: "Email is required!",
      }),
});
