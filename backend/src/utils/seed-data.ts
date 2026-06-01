import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "Password123!";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@todo.app";
const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@todo.app";

export async function runDemoSeed(prisma: PrismaClient): Promise<void> {
  const adminPlain = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const demoPlain = process.env.SEED_DEMO_PASSWORD ?? DEFAULT_PASSWORD;
  const adminPassword = await bcrypt.hash(adminPlain, 12);
  const demoPassword = await bcrypt.hash(demoPlain, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: adminPassword },
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Admin User",
      email: ADMIN_EMAIL,
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: demoPassword },
    create: {
      name: process.env.SEED_DEMO_NAME ?? "Demo User",
      email: DEMO_EMAIL,
      password: demoPassword,
      role: "USER",
    },
  });

  const existingTasks = await prisma.task.count({ where: { userId: demoUser.id } });
  if (existingTasks === 0) {
    const now = Date.now();
    const tasks = [
      {
        title: "تصميم الصفحة الرئيسية",
        description: "إنشاء مخططات ونماذج للصفحة الرئيسية الجديدة",
        priority: "HIGH" as const,
        status: "IN_PROGRESS" as const,
        position: 0,
        colorLabel: "#6366f1",
        dueDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
        expectedEndAt: new Date(now + 36 * 60 * 60 * 1000),
        reminderDate: new Date(now + 24 * 60 * 60 * 1000),
      },
      {
        title: "مراجعة طلبات الدمج",
        description: "مراجعة طلبات الفريق من هذا السبرنت",
        priority: "MEDIUM" as const,
        status: "TODO" as const,
        position: 0,
        colorLabel: "#8b5cf6",
        dueDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
        reminderDate: new Date(now + 12 * 60 * 60 * 1000),
      },
    ];
    for (const task of tasks) {
      await prisma.task.create({ data: { ...task, userId: demoUser.id } });
    }
  }

  const welcomeCount = await prisma.notification.count({
    where: { userId: demoUser.id, type: "SYSTEM", title: "مرحباً بك في تاسك فلو!" },
  });
  if (welcomeCount === 0) {
    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        type: "SYSTEM",
        title: "مرحباً بك في تاسك فلو!",
        message: "مساحة عملك جاهزة. ابدأ بإنشاء المهام لتنظيم يومك.",
      },
    });
  }
}

export const SEED_DEMO_EMAIL = DEMO_EMAIL;
export const SEED_DEFAULT_PASSWORD = DEFAULT_PASSWORD;
