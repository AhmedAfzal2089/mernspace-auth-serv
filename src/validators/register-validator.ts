import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
    },
});

//second method
// export default [body("email").notEmpty().withMessage("Email is required!")];
