"use client";

import { getTaskById, updateTask } from "@/lib/actions/kanban";
import { TaskFormValues, taskFormSchema } from "@/lib/schemas/task";
import { Column, Task } from "@/types/kanban";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface EditTaskDialogProps {
  taskId: string;
  columns: Column[];
  trigger?: React.ReactNode;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export function EditTaskDialog({
  taskId,
  columns,
  trigger,
  onTaskUpdated,
}: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      columnId: "",
    },
  });

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setSubmitSuccess(null);
      setIsLoading(false);
    }
  }, [open]);

  // Fetch task data when dialog opens
  useEffect(() => {
    if (open && taskId) {
      const fetchTask = async () => {
        setIsLoading(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
          const result = await getTaskById(taskId);
          if (result.success && result.task) {
            form.reset({
              title: result.task.title,
              description: result.task.description || "",
              priority: result.task.priority as Task["priority"],
              status: result.task.status as Task["status"],
              columnId: result.task.columnId,
            });
          } else {
            setSubmitError("Failed to load task data");
          }
        } catch (error) {
          console.error("Error fetching task:", error);
          setSubmitError("Error loading task data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchTask();
    }
  }, [open, taskId, form]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const result = await updateTask(taskId, data);

      if (result.success) {
        if (onTaskUpdated && result.task) {
          onTaskUpdated(result.task as Task);
        }
        setSubmitSuccess(result.message || "Task updated successfully");
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          form.reset();
          setOpen(false);
        }, 1500);
      } else {
        setSubmitError(
          typeof result.error === "string"
            ? result.error
            : "Failed to update task"
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setSubmitError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task.
          </DialogDescription>
        </DialogHeader>

        {isLoading && !form.formState.isSubmitting ? (
          <div className="flex items-center justify-center p-6">
            <p>Loading task data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded text-sm flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {submitSuccess}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="columnId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Column</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading || form.formState.isSubmitting || !!submitSuccess
                  }
                >
                  {form.formState.isSubmitting ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
