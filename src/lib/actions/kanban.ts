"use server";

import { KanbanDAL } from "@/lib/dal/kanban";
import { prisma } from "@/lib/prisma";
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

// Define the interface for drag and drop data
interface DragEndData {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export async function moveTask({
  taskId,
  sourceColumnId,
  destinationColumnId,
  sourceIndex,
  destinationIndex,
}: DragEndData) {
  try {
    // Check if task exists
    const existingTask = await KanbanDAL.getTaskById(taskId);

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Get all tasks in the destination column
    const destinationTasks = await KanbanDAL.getTasksByColumnId(
      destinationColumnId
    );

    // Calculate the new order value
    // If moving within the same column and going down, we need to place it after the task at the destination index
    // If moving between columns, we need to place it at the appropriate position in the new column
    let newOrder: number;

    if (destinationTasks.length === 0) {
      // If the destination column is empty, set order to 0
      newOrder = 0;
    } else if (destinationIndex === 0) {
      // If moving to the top of the column, set order to the first task's order - 1
      newOrder = destinationTasks[0].order - 1;
      if (newOrder < 0) newOrder = 0;
    } else if (destinationIndex >= destinationTasks.length) {
      // If moving to the bottom of the column, set order to the last task's order + 1
      newOrder = destinationTasks[destinationTasks.length - 1].order + 1;
    } else {
      // If moving between tasks, set order to the average of the surrounding tasks
      const prevTaskOrder = destinationTasks[destinationIndex - 1].order;
      const nextTaskOrder = destinationTasks[destinationIndex].order;
      newOrder = (prevTaskOrder + nextTaskOrder) / 2;
    }

    // Update the task with the new column and order
    await KanbanDAL.updateTaskColumnAndOrder(
      taskId,
      destinationColumnId,
      newOrder
    );

    // If the task status changed, we need to update it based on the column
    if (sourceColumnId !== destinationColumnId) {
      // Get the new column to determine the appropriate status
      const columns = await KanbanDAL.getColumns();
      const destinationColumn = columns.find(
        (column) => column.id === destinationColumnId
      );

      if (destinationColumn) {
        // Map column title to status (assuming columns have standard titles)
        const columnTitleToStatus: Record<string, string> = {
          "To Do": "todo",
          "In Progress": "in-progress",
          Done: "done",
        };

        // Try to derive status from column title, or keep existing status if mapping fails
        const newStatus =
          columnTitleToStatus[destinationColumn.title] || existingTask.status;

        // Only update if status actually changed
        if (newStatus !== existingTask.status) {
          await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
          });
        }
      }
    }

    // Normalization: Clean up order values if needed to avoid decimal buildup
    if (Math.floor(newOrder) !== newOrder) {
      // If we ended up with a decimal order value, normalize all orders in the column
      const tasksToReorder = await KanbanDAL.getTasksByColumnId(
        destinationColumnId
      );

      // Sort tasks by their current order
      const sortedTasks = [...tasksToReorder].sort((a, b) => a.order - b.order);

      // Assign sequential integers as new order values
      const orderUpdates = sortedTasks.map((task, index) => ({
        id: task.id,
        order: index,
      }));

      // Apply the order updates in a transaction
      await KanbanDAL.reorderTasks(orderUpdates);
    }

    // Revalidate the cache for the kanban board
    revalidatePath("/");

    return { success: true, message: "Task moved successfully" };
  } catch (error) {
    console.error("Failed to move task:", error);
    return { success: false, error: "Failed to move task" };
  }
}
