import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "./error.middleware.js";

export const validate = (validations) => {
    return async (req, res, next) => {
        // run all validation
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedError = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        throw new ApiError(400, "validation error");
    };
};

export const commonValidations = {
    pagination: [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be a between 1 and 100"),
    ],
    email: body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    password: body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage(
            "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character"
        ),
    name: body("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage("Name can only contain letters and spaces"),

    price: body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),

    url: body("url").isURL().withMessage("Please provide a valid URL"),
};

export const validateSignUp = validate([
    commonValidations.email,
    commonValidations.name,
    commonValidations.password,
]);
