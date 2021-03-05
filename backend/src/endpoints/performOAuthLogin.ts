import { Request, Response } from "express";
import { getRedirectUrl } from "../oauth2";

export async function PerformOAuthLogin(_: Request, res: Response) {
    res.redirect(getRedirectUrl());
}