import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, IRefershTokenPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefershTokenPayload).id), // we get string from token but we have to pass number here
                    user: { id: Number(token?.payload.sub) },
                },
            });
            return refreshToken === null; // if token is found then isRevoked will return faslse , means no logout , if not found then isRevoked will be true .
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            logger.error("Error while getting the refresh Token ", {
                id: (token?.payload as IRefershTokenPayload).id,
            });
        }
        return true;
    },
});
