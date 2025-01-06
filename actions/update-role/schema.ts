import { z } from "zod";

export const UpdateRole = z.object({
  role: z.string({
    required_error: "Role is required!",
    invalid_type_error: "Role is required!",
  }),
  email: z.string({
    required_error: "Email is required!",
    invalid_type_error: "Email is required!",
  }),
});
