import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialsService } from "../services/CredentialsService";
import { Roles } from "../constants";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialsService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug("New request to register a user ", {
            firstName,
            lastName,
            email,
            password: "******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });

            this.logger.info("User has been registered", { id: user.id });

            // send token to cookies before the response;

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            //Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id), // bcz we embed the id , so we have to send 1 more payload , so using the spreading technique in this
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h , the cookie will be valid for one hour
                httpOnly: true, // Very important
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y , the cookie will be valid for one year
                httpOnly: true, // Very important
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.debug("New request to login a user ", {
            email,
            password: "******",
        });

        // Check  if username (email) exists in database
        // compare the password
        // generate the tokens
        // add tokens to cookies
        // Return the response (id)
        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",
                );
                next(error);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );
            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",
                );
                next(error);
                return;
            }

            // send token to cookies before the response;
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant ? String(user.tenant.id) : "",
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            //Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id), // bcz we embed the id , so we have to send 1 more payload , so using the spreading technique in this
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h , the cookie will be valid for one hour
                httpOnly: true, // Very important
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y , the cookie will be valid for one year
                httpOnly: true, // Very important
            });
            this.logger.info({ id: user.id });
            res.json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        res.json({ ...user, password: undefined });
    }
    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const error = createHttpError(
                    400,
                    " User with the token could not find",
                );
                next(error);
                return;
            }
            //Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // delete old refresh token
            await this.tokenService.deleterefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id), // bcz we embed the id , so we have to send 1 more payload , so using the spreading technique in this
            });

            await this.tokenService.accessTokenInCookie(res, accessToken);

            await this.tokenService.refreshTokenInCookie(res, refreshToken);
            this.logger.info({ id: user.id });
            res.json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleterefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            }); // id is the id of token
            this.logger.info("User has been logged out", { id: req.auth.sub }); // sub is the id of user
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.json({});
        } catch (error) {
            next(error);
            return;
        }
    }
}
