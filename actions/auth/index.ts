import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string({
      message: "Username is required",
    })
    .min(3, {
      message: "Username must be at least 3 characters",
    }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const RegisterSchema = z.object({
  full_name: z.string().min(3, {
    message: "Full name must be at least 3 characters",
  }),
  username: z.string({
    message: "Username is required",
  }),
  email: z.string().email({
    message: "Invalid email",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirm_password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});
