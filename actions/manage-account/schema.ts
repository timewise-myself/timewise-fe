import { z } from "zod";

export const ManageAccount = z.object({
  first_name: z
    .string({
      required_error: "First name is required",
      invalid_type_error: "First name must be a string",
    })
    .min(3, {
      message: "Title must be at least 3 characters long",
    }),
  last_name: z
    .string({
      required_error: "Last name is required",
      invalid_type_error: "Last name must be a string",
    })
    .min(3, {
      message: "Last name must be at least 3 characters long",
    }),
  profile_picture: z.string({
    required_error: "Profile picture is required",
    invalid_type_error: "Profile picture is required",
  }),
});
