import { api } from "./api";
import type { ApiResponse, Notification } from "@/types";

export const notificationService = {
  list: (params?: { isRead?: boolean; page?: number; limit?: number }) =>
    api.get<ApiResponse<Notification[]>>("/notifications", { params }),

  markAsRead: (id: string) => api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch<ApiResponse<{ count: number }>>("/notifications/read-all"),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};
