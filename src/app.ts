/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";
const app = express();

app.use(express.json()); // middleware to accept json data
app.get("/", (req, res) => {
    res.send("Welcome to auth service");
});
app.use("/auth", authRouter);

//global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

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
