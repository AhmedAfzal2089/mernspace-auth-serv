import express, { RequestHandler } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
// the middleware expects a function, so we are using canAccess which is returing something there.
router.post("/", authenticate, canAccess([Roles.ADMIN]), (async (
    req,
    res,
    next,
) => {
    await userController.create(req, res, next);
}) as RequestHandler);

export default router;
