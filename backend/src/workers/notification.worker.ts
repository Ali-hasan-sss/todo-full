import { Worker } from "bullmq";
import { NotificationType } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { NOTIFICATION_QUEUE, type NotificationJobData } from "../services/queue.service";
import { logger } from "../utils/logger";

const typeMap: Record<string, NotificationType> = {
  REMINDER: NotificationType.REMINDER,
  DUE_SOON: NotificationType.DUE_SOON,
  OVERDUE: NotificationType.OVERDUE,
  EXPECTED_END: NotificationType.EXPECTED_END,
};

const worker = new Worker<NotificationJobData>(
  NOTIFICATION_QUEUE,
  async (job) => {
    const { userId, taskId, type, title, message } = job.data;

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId, isArchived: false },
    });

    if (!task || task.status === "DONE") {
      logger.info({ taskId }, "Skipping notification for completed/archived task");
      return;
    }

    await prisma.notification.create({
      data: {
        userId,
        taskId,
        type: typeMap[type] ?? NotificationType.SYSTEM,
        title,
        message,
      },
    });

    logger.info({ userId, taskId, type }, "Notification created");
  },
  { connection: { url: env.REDIS_URL }, concurrency: 5 },
);

worker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, "Job failed");
});

logger.info("Notification worker started");
