import type { Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export class DashboardController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getStats(req.user!.userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
