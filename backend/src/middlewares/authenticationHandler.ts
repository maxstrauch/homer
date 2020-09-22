import { Response, NextFunction } from "express";
import { debug } from 'debug';
import * as jwt from 'jsonwebtoken';
import { Config } from "../config";
import { AuthenticatedRequest, AuthInfo } from "../models/AuthenticatedRequest";
import createHttpError = require("http-errors");
// import jwt from "jsonwebtoken";

const logger = debug('app:authenticationHandler');

export function HandleAuthentication(req: AuthenticatedRequest, _: Response, next: NextFunction) {
    // logger(`Handle authentication for ${req.method} ${req.url}`);
    
    if (req.headers['authorization'] && req.headers['authorization'].toLowerCase().startsWith("bearer")) {
        const token = req.headers['authorization'].substring(7);

        try {
            let jwtData = jwt.verify(token, Config.JWT_SECRET);
            req.auth = jwtData as AuthInfo;

            if (req.auth.exp < Date.now()) {
                logger(`Token expired:`, req.auth);
                throw new createHttpError.Unauthorized(`Token expired!`);
            }

            next();
            return;
        } catch (ex) {
            logger(`Request has not valid JWT: ${ex}`);
        }
    }
    
    if (req.cookies && req.cookies[Config.COOKIE_NAME]) {
        try {
            const jwtData = jwt.verify(req.cookies[Config.COOKIE_NAME], Config.JWT_SECRET);
            req.auth = jwtData as AuthInfo;

            if (req.auth.exp < Date.now()) {
                logger(`Token expired: ${req.auth}`);
                throw new createHttpError.Unauthorized(`Token expired!`);
            }

            next();
            return;
        } catch (ex) {
            logger(`Request has not valid auth cookie: ${ex}`);
        }
    }

    throw new createHttpError.Unauthorized(`Access denied!`);
}