import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";

export default expressjwt({
    // this export will return a middleware so we can use it in route ...
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true, // to preventing again and again fetching token from a particular service
        rateLimit: true,
    }) as unknown as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        // using this that if token came in header or cookies
        const authHeader = req.headers.authorization;

        // Bearer ereholjskjsbjsksbg
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];
            if (token) {
                return token;
            }
        }
        type AuthCookie = {
            accessToken: string;
        };
        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
