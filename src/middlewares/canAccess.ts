import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;
        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                "You don't have enough permissions! ",
            );
            next(error);
            return;
        }
        next(); // it is mandatory call next here because this is a middleware , if not called then the request will hang and the transfer will not be passed..
    };
};
