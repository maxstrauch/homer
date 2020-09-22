import { Roles } from "../models/Roles";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../models/AuthenticatedRequest";
import createHttpError = require("http-errors");

export function requireRole(role: string) {
    return (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
        if ((req.auth.roles || []).indexOf('*') > -1) {
            next();
            return;
        }

        if ((req.auth.roles || []).indexOf(role) < 0) {
            // Role not present!
            throw new createHttpError.Unauthorized(`Insufficient rights!`);
        }
        next();
    };
}

export function hasRole(req: AuthenticatedRequest, role: Roles): boolean {
    if ((req.auth.roles || []).indexOf('*') > -1) {
        return true; // Admin
    }
    return req.auth && (req.auth.roles || []).includes(role);
}