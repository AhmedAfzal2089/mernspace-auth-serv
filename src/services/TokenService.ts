/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { Response } from "express";
export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, "SECRET_KEY is not set ");
            throw error;
        }
        try {
            privateKey = Config.PRIVATE_KEY;
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
    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return newRefreshToken;
    }
    async deleterefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({ id: tokenId });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async accessTokenInCookie(res: Response, accessToken: string) {
        res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1h , the cookie will be valid for one hour
            httpOnly: true, // Very important
        });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async refreshTokenInCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1h , the cookie will be valid for one hour
            httpOnly: true, // Very important
        });
    }
}
