"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types";
import { SortableTaskCard } from "@/features/kanban/sortable-task-card";
import { COLUMN_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  highlightedTaskId: string | null;
  onEditTask: (task: Task) => void;
}

export function KanbanColumn({
  status,
  tasks,
  highlightedTaskId,
  onEditTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-t-4 bg-muted/30 transition-colors",
        COLUMN_COLORS[status],
        isOver && "bg-primary/10 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{tasks.length}</span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-1 flex-col gap-2 px-3 pb-4">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              highlighted={highlightedTaskId === task.id}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
