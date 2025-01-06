import { z } from "zod";

export const LinkEmail = z.object({
  email: z
    .string()
    .min(1, "Please enter an email")
    .email("Invalid email format"),
});
