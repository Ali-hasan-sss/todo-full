import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./config/database";

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error(err, "Failed to start server");
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
