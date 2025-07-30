/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    }),
);
app.use(express.static("public")); // this will public all the data in it.
app.use(cookieParser());
app.use(express.json()); // middleware to accept json data

app.get("/", (req, res) => {
    res.send("Welcome to auth service");
});
app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

//global error handler
app.use(globalErrorHandler);

export default app;
