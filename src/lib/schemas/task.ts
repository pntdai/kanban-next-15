import { z } from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .nullable()
    .optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
  status: z.enum(["todo", "in-progress", "done"], {
    required_error: "Status is required",
  }),
  columnId: z.string().min(1, { message: "Column is required" }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
