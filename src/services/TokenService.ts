/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { Config } from "../config";
export class TokenService {
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (err) {
            const error = createHttpError(
                500,
                "Error while reading the private key ",
            );
            throw error;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
        return accessToken;
    }
    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            // ! making sure its string
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(payload.id), // embeding the refreshToken id of database to the refreshToken
        });
        return refreshToken;
    }
}
