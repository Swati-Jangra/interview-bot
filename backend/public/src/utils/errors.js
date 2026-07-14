export class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code = "APP_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
export function errorHandler(error, _req, res, _next) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR";
    res.status(statusCode).json({
        error: {
            code,
            message: statusCode === 500 ? "Something went wrong" : error.message
        }
    });
}
