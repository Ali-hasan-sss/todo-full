import { notificationRepository } from "./notification.repository";
import { NotFoundError } from "../../utils/errors";

export class NotificationService {
  async list(
    userId: string,
    options: { isRead?: boolean; page?: number; limit?: number },
  ) {
    return notificationRepository.findMany(userId, options);
  }

  async markAsRead(id: string, userId: string) {
    try {
      return await notificationRepository.markAsRead(id, userId);
    } catch {
      throw new NotFoundError("Notification not found");
    }
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  async delete(id: string, userId: string) {
    try {
      return await notificationRepository.delete(id, userId);
    } catch {
      throw new NotFoundError("Notification not found");
    }
  }
}

export const notificationService = new NotificationService();
