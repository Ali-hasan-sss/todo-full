import { z } from "zod";
import { ar } from "@/lib/translations";

export const taskFormSchema = z.object({
  title: z.string().min(1, ar.validation.titleRequired).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  dueDate: z.string().optional().nullable(),
  reminderDate: z.string().optional().nullable(),
  expectedEndAt: z.string().optional().nullable(),
  colorLabel: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const loginSchema = z.object({
  email: z.string().email(ar.validation.invalidEmail),
  password: z.string().min(1, ar.validation.passwordRequired),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, ar.validation.nameMin),
    email: z.string().email(ar.validation.invalidEmail),
    password: z
      .string()
      .min(8, ar.validation.passwordMin)
      .regex(/[A-Z]/, ar.validation.passwordUpper)
      .regex(/[a-z]/, ar.validation.passwordLower)
      .regex(/[0-9]/, ar.validation.passwordNumber),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ar.validation.passwordsMismatch,
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
