import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** CLI config (migrate/seed). Runtime URL stays in schema.prisma for Prisma 6. */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
