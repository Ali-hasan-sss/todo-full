import { api } from "./api";
import type { ApiResponse, DashboardStats } from "@/types";

export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
