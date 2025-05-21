"use client";

import { deleteTask } from "@/lib/actions/kanban";
import { Task } from "@/types/kanban";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DeleteTaskDialogProps {
  taskId: string;
  taskTitle: string;
  trigger?: React.ReactNode;
  onTaskDeleted?: () => void;
}

export function DeleteTaskDialog({
  taskId,
  taskTitle,
  trigger,
  onTaskDeleted,
}: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteTask(taskId);

      if (result.success) {
        setSuccess(result.message || "Task deleted successfully");

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          setOpen(false);
          if (onTaskDeleted) {
            onTaskDeleted();
          }
        }, 1500);
      } else {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to delete task"
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="font-medium text-center">{taskTitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded text-sm flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading || !!success}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !!success}
          >
            {isLoading ? "Deleting..." : "Delete Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
