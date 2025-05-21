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
}
