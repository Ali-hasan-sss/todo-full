import { PrismaClient } from "@prisma/client";
import { runDemoSeed } from "../src/utils/seed-data";

const prisma = new PrismaClient();

async function main() {
  await runDemoSeed(prisma);
  console.log("Seed completed:");
  console.log("  Admin: admin@todo.app / Password123!");
  console.log("  Demo:  demo@todo.app / Password123!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
