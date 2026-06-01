import type { Priority, TaskStatus } from "@/types";

export { PRIORITY_LABELS, STATUS_LABELS } from "./translations";

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export const COLUMN_COLORS: Record<TaskStatus, string> = {
  TODO: "border-t-slate-400",
  IN_PROGRESS: "border-t-blue-500",
  REVIEW: "border-t-amber-500",
  DONE: "border-t-green-500",
};

export const COLOR_OPTIONS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
];
