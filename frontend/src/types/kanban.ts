import type { Task, TaskStatus } from "@/types";

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}
