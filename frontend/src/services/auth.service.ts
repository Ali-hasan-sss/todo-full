import { api } from "./api";
import type { ApiResponse, AuthTokens, User } from "@/types";

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<ApiResponse<User>>("/auth/me"),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),
};
