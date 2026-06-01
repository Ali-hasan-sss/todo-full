import type { Response, NextFunction } from "express";
import { authService } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import type { RegisterDto, LoginDto, RefreshTokenDto } from "./auth.dto";
import { prisma } from "../../config/database";
import { runDemoSeed, SEED_DEMO_EMAIL, SEED_DEFAULT_PASSWORD } from "../../utils/seed-data";

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterDto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginDto);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      const tokens = await authService.refresh(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  /** إنشاء/تحديث حسابات demo و admin (مفيد بعد إعادة نشر Render) */
  async bootstrap(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await runDemoSeed(prisma);
      res.json({
        success: true,
        message: "Demo accounts ready",
        data: {
          demo: { email: SEED_DEMO_EMAIL, password: SEED_DEFAULT_PASSWORD },
          admin: { email: "admin@todo.app", password: SEED_DEFAULT_PASSWORD },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authRepository } = await import("./auth.repository");
      const user = await authRepository.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      const { password: _p, refreshToken: _r, ...safe } = user;
      res.json({ success: true, data: safe });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
