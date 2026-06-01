import type { Response, NextFunction } from "express";
import { taskService } from "./task.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import type { CreateTaskDto, UpdateTaskDto, TaskQueryDto, ReorderTasksDto } from "./task.dto";
import { getParam } from "../../utils/params";

export class TaskController {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await taskService.list(req.user!.userId, req.query as unknown as TaskQueryDto);
      res.json({ success: true, data: result.tasks, meta: { total: result.total } });
    } catch (error) {
      next(error);
    }
  }

  async kanban(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await taskService.getKanbanBoard(req.user!.userId);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.getById(getParam(req, "id"), req.user!.userId);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.create(req.user!.userId, req.body as CreateTaskDto);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.update(
        getParam(req, "id"),
        req.user!.userId,
        req.body as UpdateTaskDto,
      );
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.delete(getParam(req, "id"), req.user!.userId);
      res.json({ success: true, message: "Task deleted" });
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.duplicate(getParam(req, "id"), req.user!.userId);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async archive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.archive(getParam(req, "id"), req.user!.userId, true);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.archive(getParam(req, "id"), req.user!.userId, false);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.complete(getParam(req, "id"), req.user!.userId);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.reorder(req.user!.userId, req.body as ReorderTasksDto);
      res.json({ success: true, message: "Tasks reordered" });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
