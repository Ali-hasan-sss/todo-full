import type { Prisma, Task, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import type { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "./task.dto";

export class TaskRepository {
  async findMany(
    userId: string,
    query: TaskQueryDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: Prisma.TaskWhereInput = {
      userId,
      isArchived: query.isArchived ?? false,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    return prisma.task.findFirst({ where: { id, userId } });
  }

  async findByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    return prisma.task.findMany({
      where: { userId, status, isArchived: false },
      orderBy: { position: "asc" },
    });
  }

  async getMaxPosition(userId: string, status: TaskStatus): Promise<number> {
    const result = await prisma.task.aggregate({
      where: { userId, status, isArchived: false },
      _max: { position: true },
    });
    return (result._max.position ?? -1) + 1;
  }

  async create(userId: string, data: CreateTaskDto): Promise<Task> {
    const status = data.status ?? "TODO";
    const position = await this.getMaxPosition(userId, status);
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status,
        dueDate: data.dueDate,
        reminderDate: data.reminderDate,
        expectedEndAt: data.expectedEndAt,
        colorLabel: data.colorLabel,
        position,
      },
    });
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const updateData: Prisma.TaskUpdateInput = { ...data };
    if (data.status === "DONE") {
      updateData.completedAt = new Date();
    } else if (data.status) {
      updateData.completedAt = null;
    }
    return prisma.task.update({ where: { id }, data: updateData });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({ where: { id } });
  }

  async archive(id: string, archived: boolean): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: { isArchived: archived },
    });
  }

  async reorder(
    userId: string,
    updates: { id: string; status: TaskStatus; position: number }[],
  ): Promise<void> {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.task.update({
          where: { id: u.id, userId },
          data: { status: u.status, position: u.position },
        }),
      ),
    );
  }

  async duplicate(task: Task): Promise<Task> {
    const position = await this.getMaxPosition(task.userId, task.status);
    return prisma.task.create({
      data: {
        userId: task.userId,
        title: `${task.title} (copy)`,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        reminderDate: task.reminderDate,
        expectedEndAt: task.expectedEndAt,
        colorLabel: task.colorLabel,
        position,
      },
    });
  }
}

export const taskRepository = new TaskRepository();
