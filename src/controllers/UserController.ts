import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }
    async update(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid Url Param"));
            return;
        }
        this.logger.debug("Request for updating a user", req.body);
        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });

            this.logger.info("User has been updated", { id: userId });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();
            this.logger.info("All users have been fetched");
            res.json(users);
        } catch (err) {
            next(err);
        }
    }
    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid Url Param"));
        }
        try {
            const user = await this.userService.findById(Number(userId));
            if (!user) {
                next(createHttpError(404, "User not found"));
                return;
            }
            this.logger.info("User Has been fetched", { id: user.id });
            res.json(user);
        } catch (err) {
            next(err);
        }
    }
}
