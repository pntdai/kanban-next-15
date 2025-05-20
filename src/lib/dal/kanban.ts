import { prisma } from "@/lib/prisma";

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
}
