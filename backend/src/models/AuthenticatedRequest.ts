import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    auth: AuthInfo;
}

export interface AuthInfo {
    name: string;
    roles: string[];
    id: string;
    exp?: number;
    isKioskView?: boolean;
    isSSO?: boolean;
}