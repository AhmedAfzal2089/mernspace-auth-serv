/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";

const app = express();
app.use(express.static("public")); // this will public all the data in it.
app.use(cookieParser());
app.use(express.json()); // middleware to accept json data

app.get("/", (req, res) => {
    res.send("Welcome to auth service");
});
app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

//global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        error: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});
export default app;
