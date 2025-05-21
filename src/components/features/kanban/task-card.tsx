"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getColumns } from "@/lib/actions/kanban";
import { Column, Task, TaskPriority } from "@/types/kanban";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [columns, setColumns] = useState<Column[]>([]);

  // Fetch available columns for the edit dialog
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const result = await getColumns();
        if (result.columns) {
          setColumns(result.columns as Column[]);
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, []);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return "bg-blue-500 hover:bg-blue-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "high":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const onTaskUpdated = (updatedTask: Task) => {
    // The page will be revalidated by the server action
    // This is just a placeholder for any additional client-side updates if needed
  };

  const onTaskDeleted = () => {
    // The page will be revalidated by the server action
    // This is just a placeholder for any additional client-side updates if needed
  };

  return (
    <Card className="w-full mb-0 cursor-grab active:cursor-grabbing">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>

            <div className="flex">
              <EditTaskDialog
                taskId={task.id}
                columns={columns}
                onTaskUpdated={onTaskUpdated}
                trigger={
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                }
              />

              <DeleteTaskDialog
                taskId={task.id}
                taskTitle={task.title}
                onTaskDeleted={onTaskDeleted}
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      </CardContent>
    </Card>
  );
}
