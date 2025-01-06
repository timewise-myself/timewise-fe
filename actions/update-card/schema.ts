import * as z from "zod";

export const UpdateCard = z.object({
  visibility: z.string(),
  all_day: z.boolean(),
  description: z.string(),
  end_time: z.string(),
  extra_data: z.string(),
  location: z.string(),
  priority: z.string(),
  recurrence_pattern: z.string(),
  start_time: z.string(),
  status: z.string(),
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(3, {
      message: "Title must be at least 3 characters long",
    }),
});
// .refine((data) => new Date(data.start_time) < new Date(data.end_time), {
//   message: "Start time must be before end time",
//   path: ["start_time"],
// });
