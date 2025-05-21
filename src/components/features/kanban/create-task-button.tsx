"use client";

import { Button } from "@/components/ui/button";
import { Column } from "@/types/kanban";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";

interface CreateTaskButtonProps {
  columns: Column[];
}

export function CreateTaskButton({ columns }: CreateTaskButtonProps) {
  return (
    <CreateTaskDialog
      columns={columns}
      trigger={
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      }
    />
  );
}
