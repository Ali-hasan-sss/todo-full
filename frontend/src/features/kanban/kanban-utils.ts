import type { Task, TaskStatus } from "@/types";
import type { KanbanColumn } from "@/types/kanban";

export const KANBAN_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function cloneBoard(board: KanbanColumn[]): KanbanColumn[] {
  return board.map((col) => ({
    status: col.status,
    tasks: col.tasks.map((t) => ({ ...t })),
  }));
}

export function findContainer(board: KanbanColumn[], id: string): TaskStatus | null {
  if (KANBAN_STATUSES.includes(id as TaskStatus)) {
    return id as TaskStatus;
  }
  for (const col of board) {
    if (col.tasks.some((t) => t.id === id)) {
      return col.status;
    }
  }
  return null;
}

/** Moves active task to over column/index during drag (live preview). */
export function moveTaskOnBoard(
  board: KanbanColumn[],
  activeId: string,
  overId: string,
): KanbanColumn[] | null {
  const activeStatus = findContainer(board, activeId);
  const overStatus = findContainer(board, overId);
  if (!activeStatus || !overStatus) return null;

  const next = cloneBoard(board);
  const activeCol = next.find((c) => c.status === activeStatus)!;
  const overCol = next.find((c) => c.status === overStatus)!;

  const activeIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
  if (activeIndex === -1) return null;

  let overIndex = overCol.tasks.length;
  if (!KANBAN_STATUSES.includes(overId as TaskStatus)) {
    const idx = overCol.tasks.findIndex((t) => t.id === overId);
    if (idx >= 0) overIndex = idx;
  }

  if (activeStatus === overStatus && activeIndex === overIndex) {
    return null;
  }

  const [moved] = activeCol.tasks.splice(activeIndex, 1);
  const updatedTask: Task = { ...moved, status: overStatus };

  if (activeStatus === overStatus && activeIndex < overIndex) {
    overIndex -= 1;
  }

  overCol.tasks.splice(overIndex, 0, updatedTask);
  return next;
}

export function boardToReorderPayload(
  board: KanbanColumn[],
): { id: string; status: TaskStatus; position: number }[] {
  const updates: { id: string; status: TaskStatus; position: number }[] = [];
  for (const col of board) {
    col.tasks.forEach((task, index) => {
      updates.push({ id: task.id, status: col.status, position: index });
    });
  }
  return updates;
}
