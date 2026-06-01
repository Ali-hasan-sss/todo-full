import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/task.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { prisma } from "./config/database";
import bcrypt from "bcryptjs";
import { SEED_DEMO_EMAIL } from "./utils/seed-data";

const app = express();

app.use(helmet());
const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts" },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
// Alias when NEXT_PUBLIC_API_URL omits /api/v1 (POST /auth/login → 404 otherwise)
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

app.get("/health", async (_req, res) => {
  try {
    const demo = await prisma.user.findUnique({ where: { email: SEED_DEMO_EMAIL } });
    let demoLoginReady = false;
    if (demo) {
      demoLoginReady = await bcrypt.compare("Password123!", demo.password);
    }
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      demoUserExists: Boolean(demo),
      demoLoginReady,
    });
  } catch {
    res.json({ status: "ok", timestamp: new Date().toISOString(), database: "unavailable" });
  }
});

const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/dashboard", dashboardRoutes);

app.use("/api/v1", apiRouter);
app.use("/auth", authRoutes);
app.use(errorHandler);

export default app;
