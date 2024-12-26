import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
        },
        User: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        comment: {
            type: String,
            trim: true,
            required: [true, "Comment is required"],
        },
        rating: {
            type: Number,
            min: [0, "Rating should At least be 0"],
            max: [5, "Rating can not be more than 5"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

export const Rating = mongoose.model("Rating", RatingSchema);
