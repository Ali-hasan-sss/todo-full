import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Prisma 6: connection URL stays in schema.prisma; this file is for CLI (migrate/seed). */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
