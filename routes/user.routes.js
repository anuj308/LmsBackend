import express from "express";
import {
    authenticateUser,
    createUserAccount,
    getCurrentUserProfile,
    googleLogin,
    signOutUser,
    updateUserProfile,
} from "../controllers/user.controller.js";
const router = express.Router();
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignUp } from "../middleware/validation.middleware.js";

// Auth routes
router.post("/signup", validateSignUp, createUserAccount);
router.post("/loginWithGoogle", googleLogin);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);

// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.get(
    "/profile",
    isAuthenticated,
    upload.single("avatar"),
    updateUserProfile
);

export default router;
