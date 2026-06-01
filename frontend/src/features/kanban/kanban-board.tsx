"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types";
import type { KanbanColumn as KanbanColumnData } from "@/types/kanban";
import { taskService } from "@/services/task.service";
import { KanbanColumn } from "@/features/kanban/kanban-column";
import { TaskCardContent } from "@/features/tasks/task-card-content";
import { TaskDialog } from "@/features/tasks/task-dialog";
import {
  boardToReorderPayload,
  cloneBoard,
  KANBAN_STATUSES,
  moveTaskOnBoard,
} from "@/features/kanban/kanban-utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store/ui.store";
import { ar } from "@/lib/translations";

export function KanbanBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { openTaskDialog, highlightTaskId, setHighlightTaskId } = useUIStore();

  const [board, setBoard] = useState<KanbanColumnData[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const handledTaskIdRef = useRef<string | null>(null);
  const boardSnapshotRef = useRef<KanbanColumnData[]>([]);

  const { data: serverBoard, isLoading } = useQuery({
    queryKey: ["kanban"],
    queryFn: async () => {
      const res = await taskService.kanban();
      return res.data.data as KanbanColumnData[];
    },
  });

  useEffect(() => {
    if (serverBoard) {
      setBoard(cloneBoard(serverBoard));
    }
  }, [serverBoard]);

  const openTaskById = useCallback(
    async (taskId: string) => {
      const fromBoard = board.flatMap((c) => c.tasks).find((t) => t.id === taskId);
      if (fromBoard) {
        openTaskDialog(fromBoard);
        setHighlightTaskId(taskId);
        setTimeout(() => setHighlightTaskId(null), 4000);
        return;
      }

      try {
        const res = await taskService.getById(taskId);
        openTaskDialog(res.data.data);
        setHighlightTaskId(taskId);
        setTimeout(() => setHighlightTaskId(null), 4000);
      } catch {
        toast.error(ar.tasks.noTasks);
      }
    },
    [board, openTaskDialog, setHighlightTaskId],
  );

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId || isLoading) return;
    if (handledTaskIdRef.current === taskId) return;

    handledTaskIdRef.current = taskId;
    void openTaskById(taskId).then(() => {
      router.replace("/board");
    });
  }, [searchParams, isLoading, openTaskById, router]);

  useEffect(() => {
    if (!highlightTaskId) return;
    const el = document.getElementById(`task-card-${highlightTaskId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightTaskId, board]);

  const reorderMutation = useMutation({
    mutationFn: taskService.reorder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
    onError: () => {
      if (serverBoard) setBoard(cloneBoard(serverBoard));
      toast.error(ar.kanban.reorderFailed);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = board.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
    boardSnapshotRef.current = cloneBoard(board);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBoard((prev) => {
      const next = moveTaskOnBoard(prev, String(active.id), String(over.id));
      return next ?? prev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) {
      setBoard(boardSnapshotRef.current);
      return;
    }

    setBoard((prev) => {
      const finalBoard = moveTaskOnBoard(prev, String(active.id), String(over.id)) ?? prev;
      reorderMutation.mutate(boardToReorderPayload(finalBoard));
      return finalBoard;
    });
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setBoard(boardSnapshotRef.current);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {KANBAN_STATUSES.map((s) => (
          <Skeleton key={s} className="h-96 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold">{ar.kanban.title}</h2>
          <p className="text-sm text-muted-foreground">{ar.kanban.subtitle}</p>
        </div>
        <Button onClick={() => openTaskDialog()}>
          <Plus className="h-4 w-4 ms-2" />
          {ar.tasks.newTask}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-[calc(100vh-80px)] gap-4 overflow-x-auto p-6">
          {KANBAN_STATUSES.map((status) => {
            const column = board.find((c) => c.status === status);
            return (
              <KanbanColumn
                key={status}
                status={status}
                tasks={column?.tasks ?? []}
                highlightedTaskId={highlightTaskId}
                onEditTask={openTaskDialog}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}>
          {activeTask ? (
            <div className="w-[17rem] cursor-grabbing rotate-2 opacity-95 shadow-xl">
              <TaskCardContent task={activeTask} onEdit={() => undefined} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog />
    </>
  );
}
