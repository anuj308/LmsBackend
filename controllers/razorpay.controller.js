import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.models.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { ApiError, catchAsync } from "../middleware/error.middleware.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = catchAsync(async (req, res) => {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course)
        return res.status(404).json({
            success: false,
            message: "Course not found",
        });

    const newPurchase = new CoursePurchase({
        course: courseId,
        user: userId,
        amount: course.price,
        status: "pending",
    });

    const options = {
        amount: course.price * 100, // paise
        currency: "INR",
        receipt: `course_${courseId}`,
        notes: {
            courseId: courseId,
            userId: userId,
        },
    };

    const order = await razorpay.orders.create(options);

    newPurchase.paymentId = order.id;
    await newPurchase.save();

    res.status(200).json({
        success: true,
        order,
        course: {
            name: course.title,
            description: course.description,
        },
    });
});

export const verifyPayment = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });
    }

    const purchase = await CoursePurchase.findOne({
        paymentId: razorpay_payment_id,
    });

    if (!purchase) {
        return res
            .status(404)
            .json({ success: false, message: "Purchase record not found" });
    }

    purchase.status = "completed";
    await purchase.save();

    res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        courseId: purchase.courseId,
    });
});
