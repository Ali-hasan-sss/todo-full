import { Router } from "express";
import { notificationController } from "./notification.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.list.bind(notificationController));
router.patch("/read-all", notificationController.markAllAsRead.bind(notificationController));
router.patch("/:id/read", notificationController.markAsRead.bind(notificationController));
router.delete("/:id", notificationController.delete.bind(notificationController));

export default router;
