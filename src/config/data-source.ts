import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
import * as dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: false, //don't run this in production, always keep this false
    logging: false,
    entities: ["src/entity/*.{ts,js}"],
    migrations: ["src/migration/*.{ts,js}"],
    subscribers: [],
});
