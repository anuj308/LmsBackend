export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.sta("4") ? "fail" : "error";

        Error.captureStackTrace(this, this.constructor);
    }
}

export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// handles jwt error
export const handleJWTError = () => {
    new ApiError(401, "Invalid token. Please log in again");
};
