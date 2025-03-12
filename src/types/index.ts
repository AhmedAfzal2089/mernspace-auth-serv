import { Request } from "express";
export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: { sub: string; role: string; id?: string }; // the data we are sending in token
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefershTokenPayload {
    id: string;
}
