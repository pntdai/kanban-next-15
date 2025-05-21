"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Column, Task } from "@/types/kanban";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";
import { DraggableTaskCard } from "./draggable-task-card";
import { TaskCard } from "./task-card";

interface DroppableColumnProps {
  column: Column;
}

export function DroppableColumn({ column }: DroppableColumnProps) {
  const { id, title, tasks = [] } = column;
  const taskIds = tasks.map((task) => task.id);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only mounting DnD on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: {
      columnId: id,
      type: "column",
    },
  });

  return (
    <Card
      className={`h-full flex flex-col overflow-hidden ${
        isOver && mounted ? "ring-2 ring-primary ring-inset" : ""
      }`}
    >
      <CardHeader className="py-3 px-4 border-b shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          <span className="bg-gray-200 dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent
        ref={mounted ? setNodeRef : undefined}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
      >
        {mounted ? (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <DraggableTaskCard key={task.id} id={task.id} task={task} />
              ))
            ) : (
              <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tasks
                </p>
              </div>
            )}
          </SortableContext>
        ) : (
          // Non-interactive version during SSR
          <>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id}>
                  <TaskCard task={task} />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tasks
                </p>
              </div>
            )}
          </>
        )}

        <CreateTaskDialog
          columns={[column]}
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
