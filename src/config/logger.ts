import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    // where you want to store the log e.g database , files etc.
    transports: [
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "combined.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            //this will not log on the terminal, if we are in testing dev then we silent the
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.Console({
            level: "info",

            silent: Config.NODE_ENV === "test",
        }),
    ],
});

export default logger;
