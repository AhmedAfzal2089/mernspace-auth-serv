import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: "First Name  is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last Name is required!",
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: "Password is required!",
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 8 },
            errorMessage: "Password should be at least 8 chars",
        },
    },
});

//second method
// export default [body("email").notEmpty().withMessage("Email is required!")];
