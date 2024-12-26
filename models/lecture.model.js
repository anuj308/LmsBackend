import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Lecture title is required"],
            trim: true,
            maxLength: [100, "Lecture title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxLength: [
                500,
                "Lecture Description cannot exceed 100 characters",
            ],
        },
        VideoUrl: {
            type: String,
            required: [true, "Video URL is required"],
        },
        duration: {
            type: Number,
            default: 0,
        },
        publicId: {
            type: String,
            required: [true, "PublicId is required for video management"],
        },
        isPreview: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            required: [true, "Lecture order is required"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//hooks
lectureSchema.pre("save", function (next) {
    if (this.duration) {
        this.duration = Math.round(this.duration * 100) / 100;
    }
    //optional
    next();
});

export const Lecture = mongoose.model("Lecture", lectureSchema);
