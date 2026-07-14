import { AppError } from "../utils/errors.js";
export function validate(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
        if (!parsed.success) {
            throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join(", "), "VALIDATION_ERROR");
        }
        next();
    };
}
