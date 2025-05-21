"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Column as ColumnType, Task } from "@/types/kanban";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskCard } from "./task-card";

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function Column({ id, title, tasks }: ColumnProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          <span className="bg-gray-200 dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
          </div>
        )}

        <CreateTaskDialog
          columns={[
            {
              id,
              title,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          defaultColumnId={id}
          trigger={
            <Button size="sm" variant="outline" className="mt-2 w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
