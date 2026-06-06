import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/errors.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join(", "), "VALIDATION_ERROR");
    }
    next();
  };
}
