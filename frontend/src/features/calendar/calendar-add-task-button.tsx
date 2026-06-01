"use client";

import { Plus } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { dayToDateTimeLocal } from "@/lib/datetime";
import { ar } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface CalendarAddTaskButtonProps {
  date: Date;
  /** Always visible (day view); otherwise shown on parent hover */
  alwaysVisible?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
} as const;

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function CalendarAddTaskButton({
  date,
  alwaysVisible = false,
  size = "sm",
  className,
}: CalendarAddTaskButtonProps) {
  const openNewTaskDialog = useUIStore((s) => s.openNewTaskDialog);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const due = dayToDateTimeLocal(date);
    openNewTaskDialog({
      dueDate: due,
      expectedEndAt: due,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ar.calendar.addTask}
      title={ar.calendar.addTask}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all",
        "hover:scale-110 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        sizeClasses[size],
        !alwaysVisible && "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
        alwaysVisible && "opacity-100",
        className,
      )}
    >
      <Plus className={iconSizes[size]} strokeWidth={2.5} />
    </button>
  );
}
