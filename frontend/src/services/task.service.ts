import { api } from "./api";
import type { ApiResponse, KanbanColumn, Task, TaskStatus, Priority } from "@/types";

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  reminderDate?: string | null;
  expectedEndAt?: string | null;
  colorLabel?: string | null;
}

export const taskService = {
  list: (filters?: TaskFilters) =>
    api.get<ApiResponse<Task[]>>("/tasks", { params: filters }),

  kanban: () => api.get<ApiResponse<KanbanColumn[]>>("/tasks/kanban"),

  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: CreateTaskInput) => api.post<ApiResponse<Task>>("/tasks", data),

  update: (id: string, data: Partial<CreateTaskInput>) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  duplicate: (id: string) => api.post<ApiResponse<Task>>(`/tasks/${id}/duplicate`),

  archive: (id: string) => api.post<ApiResponse<Task>>(`/tasks/${id}/archive`),

  restore: (id: string) => api.post<ApiResponse<Task>>(`/tasks/${id}/restore`),

  complete: (id: string) => api.post<ApiResponse<Task>>(`/tasks/${id}/complete`),

  reorder: (tasks: { id: string; status: TaskStatus; position: number }[]) =>
    api.patch("/tasks/reorder", { tasks }),
};
