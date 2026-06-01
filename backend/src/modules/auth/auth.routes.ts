import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.dto";

const router = Router();

router.post("/bootstrap", authController.bootstrap.bind(authController));
router.post("/register", validate(registerSchema), authController.register.bind(authController));
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", validate(refreshTokenSchema), authController.refresh.bind(authController));
router.post("/logout", authenticate, authController.logout.bind(authController));
router.get("/me", authenticate, authController.me.bind(authController));

export default router;
