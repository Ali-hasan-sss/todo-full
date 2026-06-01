import { Router } from "express";
import { taskController } from "./task.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  reorderTasksSchema,
} from "./task.dto";

const router = Router();

router.use(authenticate);

router.get("/", validate(taskQuerySchema, "query"), taskController.list.bind(taskController));
router.get("/kanban", taskController.kanban.bind(taskController));
router.get("/:id", taskController.getById.bind(taskController));
router.post("/", validate(createTaskSchema), taskController.create.bind(taskController));
router.patch("/reorder", validate(reorderTasksSchema), taskController.reorder.bind(taskController));
router.patch("/:id", validate(updateTaskSchema), taskController.update.bind(taskController));
router.delete("/:id", taskController.delete.bind(taskController));
router.post("/:id/duplicate", taskController.duplicate.bind(taskController));
router.post("/:id/archive", taskController.archive.bind(taskController));
router.post("/:id/restore", taskController.restore.bind(taskController));
router.post("/:id/complete", taskController.complete.bind(taskController));

export default router;
