import { checkSchema } from "express-validator";

export default checkSchema(
    {
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    // the value comes from query as a string always
                    // '2',undefined,'afdjafsfsjl' -> NaN
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    // the value comes from query as a string always
                    // '2',undefined,'afdjafsfsjl' -> NaN
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 6 : parsedValue;
                },
            },
        },
    },
    ["query"],
);
// data is coming from query /users/currentPage?....like this
