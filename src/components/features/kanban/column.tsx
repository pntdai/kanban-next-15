"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskStatus } from "@/types/kanban";
import { TaskCard } from "./task-card";

interface ColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export function Column({ title, status, tasks }: ColumnProps) {
  // Filter tasks by status
  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          <span className="bg-gray-200 dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
