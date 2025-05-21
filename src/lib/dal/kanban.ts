import { prisma } from "@/lib/prisma";
import { TaskFormValues } from "@/lib/schemas/task";

/**
 * Data Access Layer for Kanban operations
 */
export class KanbanDAL {
  /**
   * Get all columns ordered by their position
   */
  static async getColumns() {
    return prisma.column.findMany({
      orderBy: {
        order: "asc",
      },
    });
  }

  /**
   * Get all columns with their associated tasks
   */
  static async getColumnsWithTasks() {
    return prisma.column.findMany({
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(status: string) {
    return prisma.task.findMany({
      where: {
        status,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  /**
   * Get tasks by column ID
   */
  static async getTasksByColumnId(columnId: string) {
    return prisma.task.findMany({
      where: {
        columnId,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  /**
   * Create a new task
   */
  static async createTask(data: TaskFormValues & { order: number }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        order: data.order,
        columnId: data.columnId,
      },
    });
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(id: string) {
    return prisma.task.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, data: TaskFormValues) {
    return prisma.task.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        columnId: data.columnId,
        // Note: We don't update the order here to maintain the task's position
      },
    });
  }

  /**
   * Delete a task by ID
   */
  static async deleteTask(id: string) {
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Update task column and order after drag and drop
   */
  static async updateTaskColumnAndOrder(
    id: string,
    columnId: string,
    newOrder: number
  ) {
    return prisma.task.update({
      where: {
        id,
      },
      data: {
        columnId,
        order: newOrder,
      },
    });
  }

  /**
   * Reorder tasks in a column
   */
  static async reorderTasks(tasks: { id: string; order: number }[]) {
    // Create a transaction to update multiple tasks at once
    const updateOperations = tasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: { order: task.order },
      })
    );

    return prisma.$transaction(updateOperations);
  }
}
