import { ApiError, catchAsync } from "../middleware/error.middleware";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export const createUserAccount = catchAsync(async (req, res) => {
    const { name, email, password, role = "student" } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
    });
    await User.updateLastActive();
    generateToken(res, user, "Account Created Successfully");
});

export const authenticateUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = User.findOne({ email: email.toLowerCase() }).select(
        "+password"
    );
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }
    await user.updateLastActive();
    generateToken(res, user, `Welcome back ${user.name}`);
});

export const signOutUser = catchAsync(async (_, res) => {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Signed out successfully" });
});

export const getCurrentUserProfile = catchAsync(async (req, res) => {
    const user = User.findById(req.id).populate({
        path: "enrolledCourses.course",
        select: "title thumbnail description",
    });

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    res.status(200).json({
        success: true,
        data: {
            ...user.toJSON(),
            totalEnrolledCourses: user.totalEnrolledCourses,
        },
    });
});

export const test = catchAsync(async (req, res) => {});
