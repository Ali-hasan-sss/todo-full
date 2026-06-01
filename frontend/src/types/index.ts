export type Role = "ADMIN" | "USER";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  reminderDate: string | null;
  expectedEndAt: string | null;
  position: number;
  colorLabel: string | null;
  isArchived: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  taskId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  task?: { id: string; title: string; status: TaskStatus } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, number>;
}

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface DashboardStats {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  upcoming: Pick<Task, "id" | "title" | "priority" | "status" | "dueDate" | "colorLabel">[];
  byStatus: { status: TaskStatus; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  completionTrend: { date: string; completed: number }[];
}
