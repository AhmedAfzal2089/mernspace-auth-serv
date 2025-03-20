import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        trim: true,
        errorMessage: "Tenant name is required!",
        notEmpty: true,
    },
    address: {
        trim: true,
        errorMessage: "Tenant address is required!",
        notEmpty: true,
    },
});

//second method
// export default [body("email").notEmpty().withMessage("Email is required!")];
