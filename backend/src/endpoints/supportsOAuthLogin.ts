import { Request, Response } from "express";
import { supportsOAuth2 } from "../oauth2";

export async function SupportsOAuthLogin(_: Request, res: Response) {
    res.status(200).send({
        status: 'ok',
        ...supportsOAuth2()
    });
}