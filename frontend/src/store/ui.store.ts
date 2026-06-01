import { create } from "zustand";
import type { Task } from "@/types";
import type { TaskFormValues } from "@/validators/task.schema";

export type NewTaskDefaults = Partial<
  Pick<TaskFormValues, "dueDate" | "reminderDate" | "expectedEndAt">
>;

interface UIState {
  sidebarOpen: boolean;
  taskDialogOpen: boolean;
  editingTask: Task | null;
  newTaskDefaults: NewTaskDefaults | null;
  highlightTaskId: string | null;
  searchQuery: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  closeSidebar: () => void;
  openTaskDialog: (task?: Task | null) => void;
  openNewTaskDialog: (defaults?: NewTaskDefaults) => void;
  closeTaskDialog: () => void;
  setHighlightTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  taskDialogOpen: false,
  editingTask: null,
  newTaskDefaults: null,
  highlightTaskId: null,
  searchQuery: "",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  closeSidebar: () => set({ sidebarOpen: false }),
  openTaskDialog: (task = null) =>
    set({ taskDialogOpen: true, editingTask: task, newTaskDefaults: null }),
  openNewTaskDialog: (defaults) =>
    set({ taskDialogOpen: true, editingTask: null, newTaskDefaults: defaults ?? null }),
  closeTaskDialog: () =>
    set({ taskDialogOpen: false, editingTask: null, newTaskDefaults: null }),
  setHighlightTaskId: (id) => set({ highlightTaskId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
