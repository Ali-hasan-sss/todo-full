import { PrismaClient } from "@prisma/client";
import { runDemoSeed } from "../src/utils/seed-data";

const prisma = new PrismaClient();

runDemoSeed(prisma)
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
