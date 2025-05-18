"use client";

import { Task } from "@/types/kanban";
import { Column } from "./column";

// Sample data for demonstration
const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "Research competitors",
    description: "Analyze top 5 competitors and their features",
    priority: "high",
    status: "todo",
  },
  {
    id: "2",
    title: "Design homepage",
    description: "Create wireframes for the new homepage",
    priority: "medium",
    status: "todo",
  },
  {
    id: "3",
    title: "Setup authentication",
    description: "Implement user login and registration",
    priority: "high",
    status: "in-progress",
  },
  {
    id: "4",
    title: "API documentation",
    description: "Document all API endpoints for the frontend team",
    priority: "low",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Fix navigation bug",
    description: "Fix the dropdown menu bug in mobile view",
    priority: "medium",
    status: "done",
  },
  {
    id: "6",
    title: "Implement dark mode",
    description: "Add dark mode support to the application",
    priority: "low",
    status: "done",
  },
];

export function KanbanBoard() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <Column title="To Do" status="todo" tasks={SAMPLE_TASKS} />
      <Column title="In Progress" status="in-progress" tasks={SAMPLE_TASKS} />
      <Column title="Done" status="done" tasks={SAMPLE_TASKS} />
    </div>
  );
}
