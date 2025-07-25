import express, { NextFunction, RequestHandler, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import createUserValidator from "../validators/create-user-validator";
import updateUserValidator from "../validators/update-user-validator";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import listUsersValidator from "../validators/list-users-validator";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);
// the middleware expects a function, so we are using canAccess which is returing something there.
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (async (req: CreateUserRequest, res: Response, next: NextFunction) => {
        await userController.create(req, res, next);
    }) as RequestHandler,
);

// update route
router.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (async (req: UpdateUserRequest, res: Response, next: NextFunction) => {
        await userController.update(req, res, next);
    }) as RequestHandler,
);

// all users route
router.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    listUsersValidator,
    (async (req, res, next) => {
        await userController.getAll(req, res, next);
    }) as RequestHandler,
);

// one user route
router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (async (
    req,
    res,
    next,
) => {
    await userController.getOne(req, res, next);
}) as RequestHandler);

// delete user route
router.delete("/:id", authenticate, canAccess([Roles.ADMIN]), (async (
    req,
    res,
    next,
) => {
    await userController.destroy(req, res, next);
}) as RequestHandler);

export default router;
