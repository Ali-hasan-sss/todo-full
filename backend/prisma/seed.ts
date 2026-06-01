import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@todo.app";
const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@todo.app";

async function seedAdmin(hashedPassword: string) {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: process.env.SEED_ADMIN_PASSWORD ? { password: hashedPassword } : {},
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Admin User",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  return admin;
}

async function seedDemoUser(hashedPassword: string) {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: process.env.SEED_DEMO_PASSWORD ? { password: hashedPassword } : {},
    create: {
      name: process.env.SEED_DEMO_NAME ?? "Demo User",
      email: DEMO_EMAIL,
      password: hashedPassword,
      role: "USER",
    },
  });
}

async function seedDemoTasks(userId: string) {
  const existingTasks = await prisma.task.count({ where: { userId } });
  if (existingTasks > 0) {
    console.log(`  Demo tasks already exist (${existingTasks}), skipping`);
    return 0;
  }

  const tasks = [
    {
      title: "تصميم الصفحة الرئيسية",
      description: "إنشاء مخططات ونماذج للصفحة الرئيسية الجديدة",
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      position: 0,
      colorLabel: "#6366f1",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      expectedEndAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      title: "مراجعة طلبات الدمج",
      description: "مراجعة طلبات الفريق من هذا السبرنت",
      priority: "MEDIUM" as const,
      status: "TODO" as const,
      position: 0,
      colorLabel: "#8b5cf6",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      title: "كتابة توثيق API",
      description: "توثيق جميع نقاط REST مع أمثلة",
      priority: "LOW" as const,
      status: "REVIEW" as const,
      position: 0,
      colorLabel: "#06b6d4",
    },
    {
      title: "إعداد خط CI/CD",
      description: "تهيئة GitHub Actions للاختبار الآلي",
      priority: "URGENT" as const,
      status: "TODO" as const,
      position: 1,
      colorLabel: "#ef4444",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expectedEndAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      title: "ملاحظات الاجتماع اليومي",
      description: "إعداد جدول أعمال الاجتماع الأسبوعي",
      priority: "LOW" as const,
      status: "DONE" as const,
      position: 0,
      colorLabel: "#22c55e",
      completedAt: new Date(),
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId } });
  }

  return tasks.length;
}

async function seedWelcomeNotification(userId: string) {
  const existing = await prisma.notification.count({
    where: { userId, type: "SYSTEM", title: "مرحباً بك في تاسك فلو!" },
  });
  if (existing > 0) return;

  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title: "مرحباً بك في تاسك فلو!",
      message: "مساحة عملك جاهزة. ابدأ بإنشاء المهام لتنظيم يومك.",
    },
  });
}

async function main() {
  const adminPlain = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const demoPlain = process.env.SEED_DEMO_PASSWORD ?? DEFAULT_PASSWORD;
  const adminPassword = await bcrypt.hash(adminPlain, 12);
  const demoPassword = await bcrypt.hash(demoPlain, 12);

  await seedAdmin(adminPassword);
  const demoUser = await seedDemoUser(demoPassword);
  const taskCount = await seedDemoTasks(demoUser.id);
  await seedWelcomeNotification(demoUser.id);

  console.log("Seed completed:");
  console.log(`  Admin: ${ADMIN_EMAIL} / ${adminPlain}`);
  console.log(`  Demo:  ${DEMO_EMAIL} / ${demoPlain}`);
  if (taskCount > 0) {
    console.log(`  Created ${taskCount} sample tasks for demo user`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
