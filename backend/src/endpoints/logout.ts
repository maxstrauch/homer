import { Request, Response } from "express";
import { Config } from "../config";

export async function Logout(_: Request, res: Response) {
    res.clearCookie(Config.COOKIE_NAME).redirect('/login.html');
}
