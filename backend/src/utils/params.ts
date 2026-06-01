import type { Request } from "express";

export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0]) return value[0];
  throw new Error(`Missing route parameter: ${key}`);
}
