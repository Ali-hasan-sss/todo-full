"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { TaskCardContent } from "@/features/tasks/task-card-content";
import { cn } from "@/lib/utils";

interface SortableTaskCardProps {
  task: Task;
  highlighted?: boolean;
  onEdit: (task: Task) => void;
}

export function SortableTaskCard({ task, highlighted, onEdit }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      id={`task-card-${task.id}`}
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCardContent
        task={task}
        highlighted={highlighted}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
      />
    </div>
  );
}
