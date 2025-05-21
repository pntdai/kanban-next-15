"use client";

import { moveTask } from "@/lib/actions/kanban";
import { Column, Task } from "@/types/kanban";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DroppableColumn } from "./droppable-column";

interface KanbanBoardClientProps {
  columns: Column[];
}

export function KanbanBoardClient({
  columns: initialColumns,
}: KanbanBoardClientProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only mounting DnD on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local state when props change (e.g. after a server revalidation)
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px minimum drag distance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the column and task when a drag starts
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id.toString();

    // Find the task across all columns
    const draggedTask = columns
      .flatMap((col) => col.tasks || [])
      .find((task) => task.id === taskId);

    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  // Update UI immediately for a responsive feel
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) return;

    const activeId = active.id;
    const overId = over.id;

    // Return if the task is dropped over itself
    if (activeId === overId) return;

    // Handle task dropped over another task
    if (typeof activeId === "string" && typeof overId === "string") {
      // Find source column and task index
      const activeTask = columns
        .flatMap((col) => col.tasks || [])
        .find((task) => task.id === activeId);

      if (!activeTask) return;

      // Check if dropped over a task or a column
      if (overId.startsWith("column-")) {
        // Dropped over a column
        const overColumnId = overId.replace("column-", "");

        // Find the source and destination columns
        const sourceColumn = columns.find((col) =>
          col.tasks?.some((task) => task.id === activeId)
        );
        const destinationColumn = columns.find(
          (col) => col.id === overColumnId
        );

        if (!sourceColumn || !destinationColumn) return;

        // Return if column hasn't changed
        if (sourceColumn.id === destinationColumn.id) return;

        // Update the UI optimistically
        setColumns((prevColumns) => {
          // Remove the task from the source column
          const updatedSourceColumn = {
            ...sourceColumn,
            tasks:
              sourceColumn.tasks?.filter((task) => task.id !== activeId) || [],
          };

          // Add the task to the destination column
          const updatedDestinationColumn = {
            ...destinationColumn,
            tasks: [...(destinationColumn.tasks || []), activeTask],
          };

          // Return the updated columns
          return prevColumns.map((col) => {
            if (col.id === sourceColumn.id) return updatedSourceColumn;
            if (col.id === destinationColumn.id)
              return updatedDestinationColumn;
            return col;
          });
        });
      }
    }
  };

  // Handle drag end and persist changes to the server
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active || !activeTask) {
      setActiveTask(null);
      return;
    }

    // Extract IDs
    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find source column
    const sourceColumn = columns.find((col) =>
      col.tasks?.some((task) => task.id === activeId)
    );

    if (!sourceColumn) {
      setActiveTask(null);
      return;
    }

    // Find destination - could be a column or a task
    let destinationColumn: Column;
    let destinationIndex: number;

    if (overId.startsWith("column-")) {
      // Dropped directly onto a column
      const overColumnId = overId.replace("column-", "");
      destinationColumn = columns.find(
        (col) => col.id === overColumnId
      ) as Column;
      // Place at the end of the column
      destinationIndex = (destinationColumn.tasks || []).length;
    } else {
      // Dropped onto another task
      const overTask = columns
        .flatMap((col) => col.tasks || [])
        .find((task) => task.id === overId);

      if (!overTask) {
        setActiveTask(null);
        return;
      }

      // Find the column containing the destination task
      destinationColumn = columns.find((col) =>
        col.tasks?.some((task) => task.id === overId)
      ) as Column;

      // Find the index of the task being dropped on
      destinationIndex = (destinationColumn.tasks || []).findIndex(
        (task) => task.id === overId
      );
    }

    // Skip if destination is the same as source and dragging over itself
    if (sourceColumn.id === destinationColumn.id && activeId === overId) {
      setActiveTask(null);
      return;
    }

    // Handle reordering within the same column
    if (sourceColumn.id === destinationColumn.id) {
      const sourceIndex =
        sourceColumn.tasks?.findIndex((task) => task.id === activeId) || 0;

      // Skip if position hasn't changed
      if (sourceIndex === destinationIndex) {
        setActiveTask(null);
        return;
      }

      // Update the UI optimistically
      setColumns((prevColumns) => {
        return prevColumns.map((col) => {
          if (col.id === sourceColumn.id) {
            const newTasks = Array.from(col.tasks || []);
            const [movedTask] = newTasks.splice(sourceIndex, 1);
            newTasks.splice(destinationIndex, 0, movedTask);
            return { ...col, tasks: newTasks };
          }
          return col;
        });
      });
    } else {
      // Already handled the move between columns in dragOver for a responsive feel
      // We just need the indexes for the server update
    }

    // Find correct source index (in case UI state changed during drag)
    const sourceIndex =
      sourceColumn.tasks?.findIndex((task) => task.id === activeId) || 0;

    // Update the server
    try {
      const result = await moveTask({
        taskId: activeId,
        sourceColumnId: sourceColumn.id,
        destinationColumnId: destinationColumn.id,
        sourceIndex,
        destinationIndex,
      });

      if (!result.success) {
        toast.error("Failed to move task: " + result.error);
        // Note: server revalidation will restore the correct state
      }
    } catch (error) {
      console.error("Error moving task:", error);
      toast.error("An unexpected error occurred while moving the task");
      // Server revalidation will restore the correct state
    } finally {
      setActiveTask(null);
    }
  };

  // Show a simple loading state or non-interactive view during SSR/before hydration
  if (!mounted) {
    return (
      <div className="flex h-full overflow-x-auto pb-4">
        <div className="flex gap-4">
          {columns.map((column) => (
            <div key={column.id} className="w-[300px] flex-shrink-0">
              <DroppableColumn column={column} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-x-auto pb-4">
        <div className="flex gap-4">
          {columns.map((column) => (
            <div key={column.id} className="w-[300px] flex-shrink-0">
              <DroppableColumn column={column} />
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
