import type { Response, NextFunction } from "express";
import { authService } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import type { RegisterDto, LoginDto, RefreshTokenDto } from "./auth.dto";

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
