import type { Notification } from "@prisma/client";
import { prisma } from "../../config/database";

export class NotificationRepository {
  async findMany(
    userId: string,
    options: { isRead?: boolean; page?: number; limit?: number },
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const where = {
      userId,
      ...(options.isRead !== undefined && { isRead: options.isRead }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { task: { select: { id: true, title: true, status: true } } },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<Notification> {
    return prisma.notification.delete({ where: { id, userId } });
  }
}

export const notificationRepository = new NotificationRepository();
