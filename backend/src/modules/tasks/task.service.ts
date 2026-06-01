import type { Task } from "@prisma/client";
import { taskRepository } from "./task.repository";
import type {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  ReorderTasksDto,
} from "./task.dto";
import { NotFoundError } from "../../utils/errors";
import { scheduleTaskReminders, cancelTaskReminders } from "../../services/queue.service";

export class TaskService {
  async list(userId: string, query: TaskQueryDto) {
    return taskRepository.findMany(userId, query);
  }

  async getById(id: string, userId: string): Promise<Task> {
    const task = await taskRepository.findById(id, userId);
    if (!task) throw new NotFoundError("Task not found");
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await taskRepository.create(userId, dto);
    if (task.reminderDate || task.dueDate) {
      await scheduleTaskReminders(task);
    }
    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.getById(id, userId);
    const task = await taskRepository.update(id, dto);
    await cancelTaskReminders(id);
    if (task.reminderDate || task.dueDate) {
      await scheduleTaskReminders(task);
    }
    return task;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await cancelTaskReminders(id);
    await taskRepository.delete(id);
  }

  async duplicate(id: string, userId: string): Promise<Task> {
    const task = await this.getById(id, userId);
    return taskRepository.duplicate(task);
  }

  async archive(id: string, userId: string, archived: boolean): Promise<Task> {
    await this.getById(id, userId);
    if (archived) await cancelTaskReminders(id);
    return taskRepository.archive(id, archived);
  }

  async complete(id: string, userId: string): Promise<Task> {
    return this.update(id, userId, { status: "DONE" });
  }

  async reorder(userId: string, dto: ReorderTasksDto): Promise<void> {
    const ids = dto.tasks.map((t) => t.id);
    const existing = await Promise.all(
      ids.map((id) => taskRepository.findById(id, userId)),
    );
    if (existing.some((t) => !t)) {
      throw new NotFoundError("One or more tasks not found");
    }
    await taskRepository.reorder(userId, dto.tasks);
  }

  async getKanbanBoard(userId: string) {
    const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
    const columns = await Promise.all(
      statuses.map(async (status) => ({
        status,
        tasks: await taskRepository.findByStatus(userId, status),
      })),
    );
    return columns;
  }
}

export const taskService = new TaskService();
