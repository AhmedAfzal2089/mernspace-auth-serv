import express, { NextFunction, Request, RequestHandler } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { CreateTenantRequest } from "../types";
import { Response } from "express";
import tenantValidator from "../validators/tenant-validator";
import listTenantValidator from "../validators/list-tenant-validator";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
// the middleware expects a function, so we are using canAccess which is returing something there.
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.create(req, res, next);
    }) as RequestHandler,
);
router.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.update(req, res, next);
    }) as RequestHandler,
);
router.get("/", listTenantValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await tenantController.getAll(req, res, next);
}) as RequestHandler);

router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await tenantController.getOne(req, res, next);
}) as RequestHandler);

router.delete("/:id", authenticate, canAccess([Roles.ADMIN]), (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await tenantController.destroy(req, res, next);
}) as RequestHandler);

export default router;
