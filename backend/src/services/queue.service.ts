import { Queue } from "bullmq";
import type { Task } from "@prisma/client";
import { env } from "../config/env";

export const NOTIFICATION_QUEUE = "notifications";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const notificationQueue = new Queue(NOTIFICATION_QUEUE, {
  connection: { url: env.REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

export type NotificationJobType =
  | "REMINDER"
  | "DUE_SOON"
  | "OVERDUE"
  | "EXPECTED_END";

export interface NotificationJobData {
  userId: string;
  taskId: string;
  type: NotificationJobType;
  title: string;
  message: string;
}

function getJobId(taskId: string, type: NotificationJobType): string {
  return `${taskId}__${type}`;
}

function formatDateTimeAr(date: Date): string {
  return date.toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function scheduleAt(
  jobs: { delay: number; type: NotificationJobType; title: string; message: string }[],
  at: Date,
  job: Omit<(typeof jobs)[number], "delay">,
): void {
  const delay = at.getTime() - Date.now();
  if (delay > 0) {
    jobs.push({ ...job, delay });
  }
}

export async function scheduleTaskReminders(task: Task): Promise<void> {
  const jobs: { delay: number; type: NotificationJobType; title: string; message: string }[] =
    [];

  if (task.reminderDate) {
    scheduleAt(jobs, task.reminderDate, {
      type: "REMINDER",
      title: "تذكير بمهمة",
      message: `تذكير: «${task.title}» — ${formatDateTimeAr(task.reminderDate)}`,
    });
  }

  if (task.dueDate) {
    const dueSoonAt = new Date(task.dueDate.getTime() - ONE_HOUR_MS);
    scheduleAt(jobs, dueSoonAt, {
      type: "DUE_SOON",
      title: "اقتراب موعد الاستحقاق",
      message: `مهمة «${task.title}» مستحقة الساعة ${formatDateTimeAr(task.dueDate)} (خلال ساعة)`,
    });

    scheduleAt(jobs, task.dueDate, {
      type: "OVERDUE",
      title: "مهمة متأخرة",
      message: `مهمة «${task.title}» تجاوزت موعد الاستحقاق (${formatDateTimeAr(task.dueDate)})`,
    });
  }

  if (task.expectedEndAt) {
    scheduleAt(jobs, task.expectedEndAt, {
      type: "EXPECTED_END",
      title: "موعد الإنهاء المتوقع",
      message: `حان وقت إنهاء المهمة «${task.title}» — ${formatDateTimeAr(task.expectedEndAt)}`,
    });
  }

  for (const job of jobs) {
    await notificationQueue.add(
      job.type,
      {
        userId: task.userId,
        taskId: task.id,
        type: job.type,
        title: job.title,
        message: job.message,
      } satisfies NotificationJobData,
      {
        delay: job.delay,
        jobId: getJobId(task.id, job.type),
      },
    );
  }
}

export async function cancelTaskReminders(taskId: string): Promise<void> {
  const types: NotificationJobType[] = [
    "REMINDER",
    "DUE_SOON",
    "OVERDUE",
    "EXPECTED_END",
  ];
  for (const type of types) {
    const job = await notificationQueue.getJob(getJobId(taskId, type));
    if (job) await job.remove();
  }
}
