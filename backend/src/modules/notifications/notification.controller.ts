import type { Response, NextFunction } from "express";
import { notificationService } from "./notification.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { getParam } from "../../utils/params";

export class NotificationController {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isRead =
        req.query.isRead === "true"
          ? true
          : req.query.isRead === "false"
            ? false
            : undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await notificationService.list(req.user!.userId, {
        isRead,
        page,
        limit,
      });
      res.json({
        success: true,
        data: result.notifications,
        meta: { total: result.total, unreadCount: result.unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(
        getParam(req, "id"),
        req.user!.userId,
      );
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.delete(getParam(req, "id"), req.user!.userId);
      res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
