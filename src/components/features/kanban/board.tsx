import { getColumnWithTasks } from "@/lib/actions/kanban";
import { Column as ColumnType, Task } from "@/types/kanban";
import { Column as ColumnComponent } from "./column";
import { CreateTaskButton } from "./create-task-button";

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
      <div className="flex-1 w-full overflow-x-auto">
        <div className="flex-1 flex gap-4 w-full min-w-full">
          {typedColumns.map((column: ColumnType) => (
            <div key={column.id} className="flex-1 min-w-[300px]">
              <ColumnComponent
                id={column.id}
                title={column.title}
                tasks={column.tasks || []}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
