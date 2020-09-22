import { Request, Response } from "express";
const packageJson = require("../../package.json");

export async function Version(_: Request, res: Response) {
    res.status(200).send({
        status: 'OK',
        version: packageJson.version
    });
}