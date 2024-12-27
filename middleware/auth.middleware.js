import { ApiError, catchAsync, handleJWTError } from "./error.middleware";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsync(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        throw new ApiError(401, "You are not logged in");
    }

    try {
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        req.id = decoded.userId;
        next();
    } catch (error) { // can give more informative error like jwt expired etc
        throw new handleJWTError();
    }
});
