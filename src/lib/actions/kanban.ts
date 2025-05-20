"use server";

import { KanbanDAL } from "@/lib/dal/kanban";

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
