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

    return {
      success: true,
      task: newTask,
      message: "Task created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.format() };
    }

    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function getTaskById(id: string) {
  try {
    const task = await KanbanDAL.getTaskById(id);

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return { success: true, task };
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return { success: false, error: "Failed to fetch task" };
  }
}

export async function updateTask(
  id: string,
  values: z.infer<typeof taskFormSchema>
) {
  try {
    // Check if task exists
    const existingTask = await KanbanDAL.getTaskById(id);

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Validate the form data on the server
    const validatedFields = taskFormSchema.parse(values);

    // Update the task
    const updatedTask = await KanbanDAL.updateTask(id, validatedFields);

    // Revalidate the cache for the kanban board
    revalidatePath("/");

    return {
      success: true,
      task: updatedTask,
      message: "Task updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.format() };
    }

    console.error("Failed to update task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  try {
    // Check if task exists before deletion
    const existingTask = await KanbanDAL.getTaskById(id);

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Delete the task
    await KanbanDAL.deleteTask(id);

    // Revalidate the cache for the kanban board
    revalidatePath("/");

    return {
      success: true,
      message: "Task deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
