import { z } from "zod";
import { Priority, TaskStatus } from "@prisma/client";

const priorityEnum = z.nativeEnum(Priority);
const statusEnum = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  dueDate: z.coerce.date().optional().nullable(),
  reminderDate: z.coerce.date().optional().nullable(),
  expectedEndAt: z.coerce.date().optional().nullable(),
  colorLabel: z.string().max(20).optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  isArchived: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sortBy: z
    .enum(["createdAt", "dueDate", "priority", "position", "title"])
    .default("position"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().cuid(),
      status: statusEnum,
      position: z.number().int().min(0),
    }),
  ),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
export type ReorderTasksDto = z.infer<typeof reorderTasksSchema>;
