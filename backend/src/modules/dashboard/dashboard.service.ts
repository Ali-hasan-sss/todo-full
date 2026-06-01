import { prisma } from "../../config/database";

export class DashboardService {
  async getStats(userId: string) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, completed, pending, overdue, upcoming] = await Promise.all([
      prisma.task.count({ where: { userId, isArchived: false } }),
      prisma.task.count({
        where: { userId, isArchived: false, status: "DONE" },
      }),
      prisma.task.count({
        where: {
          userId,
          isArchived: false,
          status: { not: "DONE" },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          isArchived: false,
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          isArchived: false,
          status: { not: "DONE" },
          dueDate: { gte: now, lte: weekFromNow },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
          colorLabel: true,
        },
      }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byStatus = await prisma.task.groupBy({
      by: ["status"],
      where: { userId, isArchived: false },
      _count: { id: true },
    });

    const byPriority = await prisma.task.groupBy({
      by: ["priority"],
      where: { userId, isArchived: false, status: { not: "DONE" } },
      _count: { id: true },
    });

    const last7Days = await this.getCompletionTrend(userId);

    return {
      stats: { total, completed, pending, overdue, completionRate },
      upcoming,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byPriority: byPriority.map((p) => ({
        priority: p.priority,
        count: p._count.id,
      })),
      completionTrend: last7Days,
    };
  }

  private async getCompletionTrend(userId: string) {
    const days: { date: string; completed: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.task.count({
        where: {
          userId,
          status: "DONE",
          completedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      days.push({
        date: dayStart.toISOString().split("T")[0],
        completed: count,
      });
    }

    return days;
  }
}

export const dashboardService = new DashboardService();
