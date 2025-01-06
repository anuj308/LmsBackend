import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { uploadMedia, deleteMediaFromCloudinary } from "../utils/cloudinary.js";

export const createUserAccount = catchAsync(async (req, res) => {
    const { name, email, password, role = "student" } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const createUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
    });

    const user = await User.findById(createUser._id);

    await user.updateLastActive();
    generateToken(res, user, "Account Created Successfully");
});

export const authenticateUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
    );
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }
    await user.updateLastActive();
    generateToken(res, user, `Welcome back ${user.name}`);
});

export const googleLogin = catchAsync(async (req, res) => {
    const { name, email, role = "student", picture } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        const user = User({
            name,
            email: email.toLowerCase(),
            role,
            avatar: picture,
        });
        await user.save({ validateBeforeSave: false });
        await user.updateLastActive();
        generateToken(res, user, "Account Created Successfully");
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

export const updateUserProfile = catchAsync(async (req, res) => {
    const { name, email, bio } = req.body;
    const updateData = {
        name,
        email: email?.toLowerCase(),
        bio,
    };

    if (req.files) {
        const avatarResult = await uploadMedia(req.file.path);
        updateData.avatar = avatarResult.secure_url;

        // delete old avatar
        const user = await User.findById(req.id);
        if (user.avatar && user.avatar !== "default-avatar.png") {
            await deleteMediaFromCloudinary(user.avatar);
        }
    }
    // update the user
    const updatedUser = await User.findByIdAndUpdate(req.id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
        data: updatedUser,
    });
});

export const test = catchAsync(async (req, res) => {});
