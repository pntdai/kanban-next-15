"use server";

import { KanbanDAL } from "@/lib/dal/kanban";
import { taskFormSchema } from "@/lib/schemas/task";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getColumns() {
  try {
    const columns = await KanbanDAL.getColumns();
    return { columns };
  } catch (error) {
    console.error("Failed to fetch columns:", error);
    throw new Error("Failed to fetch columns");
  }
}

export async function getColumnWithTasks() {
  try {
    const columns = await KanbanDAL.getColumnsWithTasks();
    return { columns };
  } catch (error) {
    console.error("Failed to fetch columns with tasks:", error);
    throw new Error("Failed to fetch columns with tasks");
  }
}

export async function getTasksByStatus(status: string) {
  try {
    const tasks = await KanbanDAL.getTasksByStatus(status);
    return { tasks };
  } catch (error) {
    console.error(`Failed to fetch tasks with status ${status}:`, error);
    throw new Error(`Failed to fetch tasks with status ${status}`);
  }
}

export async function createTask(values: z.infer<typeof taskFormSchema>) {
  try {
    // Validate the form data on the server
    const validatedFields = taskFormSchema.parse(values);

    // Get the highest order number for tasks in the column
    const tasks = await KanbanDAL.getTasksByColumnId(validatedFields.columnId);
    const order =
      tasks.length > 0 ? Math.max(...tasks.map((task) => task.order)) + 1 : 0;

    // Create the task
    const newTask = await KanbanDAL.createTask({
      ...validatedFields,
      order,
    });

    // Revalidate the cache for the kanban board
    revalidatePath("/");

    return { success: true, task: newTask };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.format() };
    }

    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}
