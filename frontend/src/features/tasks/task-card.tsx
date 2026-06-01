"use client";

import type { Task } from "@/types";
import { TaskCardContent } from "./task-card-content";

interface TaskCardProps {
  task: Task;
  highlighted?: boolean;
  onEdit: (task: Task) => void;
}

/** Task card for non-kanban lists (no drag handle). */
export function TaskCard({ task, highlighted, onEdit }: TaskCardProps) {
  return <TaskCardContent task={task} highlighted={highlighted} onEdit={onEdit} />;
}
