import { Suspense } from "react";
import { KanbanBoard } from "@/features/kanban/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-4 gap-4 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      }
    >
      <KanbanBoard />
    </Suspense>
  );
}
