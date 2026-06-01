"use client";

import { isPast } from "date-fns";
import { Calendar, Clock, GripVertical, MoreHorizontal } from "lucide-react";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDateTimeShort } from "@/lib/datetime";
import { cn } from "@/lib/utils";

interface TaskCardContentProps {
  task: Task;
  highlighted?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onEdit: (task: Task) => void;
}

export function TaskCardContent({
  task,
  highlighted,
  dragHandleProps,
  onEdit,
}: TaskCardContentProps) {
  const overdue =
    task.dueDate && task.status !== "DONE" && isPast(new Date(task.dueDate));

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        highlighted && "ring-2 ring-primary shadow-md",
      )}
      onClick={() => onEdit(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit(task);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {task.colorLabel && (
            <div
              className="mb-2 h-1 w-8 rounded-full"
              style={{ backgroundColor: task.colorLabel }}
            />
          )}
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-3 flex flex-col gap-1">
            <Badge className={cn("w-fit text-[10px]", PRIORITY_COLORS[task.priority])} variant="outline">
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            {task.expectedEndAt && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                {formatDateTimeShort(task.expectedEndAt)}
              </span>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px]",
                  overdue ? "font-medium text-destructive" : "text-muted-foreground",
                )}
              >
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDateTimeShort(task.dueDate)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
