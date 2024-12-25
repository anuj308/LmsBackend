import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxLength: [50, "Name cannot exceed 50 charaters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true,
            match: [
                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minLength: [8, "Password must be of atleast 8 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: {
                // is options
                values: ["student", "instruct", "admin"],
                message: "Please select a valid role",
            },
            default: "student",
        },
        avatar: {
            type: String,
            default: "default-avatar.png",
        },
        bio: {
            type: String,
            maxLength: [200, "Bio cannot exceed 200 characters"],
        },
        enrolledCourses: [
            {
                course: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
                enrolledAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        createdCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastActive: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//hashing the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// compare password
userSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

userSchema.methods.updateLastActive = function () {
    this.lastActive = Date.now();
    return this.lastActive({ validateBeforeSave: false });
};

// virtual field for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function () {
    return this.enrolledCourses.lenght;
});

export const User = mongoose.model("User", userSchema);
