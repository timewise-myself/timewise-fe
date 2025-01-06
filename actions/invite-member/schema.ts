import { z } from "zod";

export const InviteMembers = z.object({
  email: z.string({
    required_error: "Email is required!",
    invalid_type_error: "Email is required!",
  }),
});

export const SendingInvitation = z.object({
  email: z.string({
    required_error: "Email is required!",
    invalid_type_error: "Email is required!",
  }),
  role: z.string({
    required_error: "Role is required!",
    invalid_type_error: "Role is required!",
  }),
});
