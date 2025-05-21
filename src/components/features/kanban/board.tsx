import { getColumnWithTasks } from "@/lib/actions/kanban";
import { Column as ColumnType, Task } from "@/types/kanban";
import { CreateTaskButton } from "./create-task-button";
import { KanbanBoardClient } from "./kanban-board-client";

export async function KanbanBoard() {
  // Fetch columns and tasks from the server
  const { columns } = await getColumnWithTasks();

  // Cast the returned data to match our types
  const typedColumns = columns.map((column: any) => ({
    ...column,
    tasks:
      column.tasks?.map((task: any) => ({
        ...task,
        priority: task.priority as Task["priority"],
        status: task.status as Task["status"],
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      })) || [],
  }));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Tasks</h2>
        <CreateTaskButton columns={typedColumns} />
      </div>
      <div className="flex-1 w-full overflow-hidden">
        <KanbanBoardClient columns={typedColumns} />
      </div>
    </div>
  );
}
