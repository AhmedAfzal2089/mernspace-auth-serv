import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        errorMessage: "Name is required!",
        notEmpty: true,
        trim: true,
    },
    address: {
        errorMessage: "Adress is required!",
        notEmpty: true,
        trim: true,
    },
});

//second method
// export default [body("email").notEmpty().withMessage("Email is required!")];
