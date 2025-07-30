import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "First name is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last name is required!",
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: "Role is required!",
        notEmpty: true,
        trim: true,
    },
    email: {
        isEmail: {
            errorMessage: "Invalid Email",
        },
        notEmpty: true,
        errorMessage: "Role is required!",
        trim: true,
    },
    tenantId: {
        notEmpty: true,
        errorMessage: "Tenant id  is required!",
        trim: true,
    },
});
