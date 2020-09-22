import { Request, Response, NextFunction } from "express";

type ExpressAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncRouteHandler(fn: ExpressAsyncHandler) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}