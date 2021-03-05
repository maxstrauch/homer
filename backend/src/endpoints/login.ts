import { Request, Response } from "express";
import * as Joi from 'joi';
import { Schema } from 'joi';
import * as jwt from 'jsonwebtoken';
import { Config } from "../config";
import { UserEntity } from "../models/UserEntity";
import createHttpError = require("http-errors");
import { AuthInfo } from "../models/AuthenticatedRequest";

interface RequestDto {
    name: string;
    password: string;
}

const MODEL: Schema = Joi.object().keys({
    name: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(0).max(100).required()
});

export async function Login(req: Request, res: Response) {

    const dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });

    const [user, _] = await UserEntity.findUserByCredentials(dto.name, dto.password);

    if (!user) {
        throw new createHttpError.Unauthorized(`Invalid credentials!`);
    }

    const payloadToken: AuthInfo = user.toJwtPayload();
    payloadToken.exp = Date.now() + 1000*24*60*60 * Config.USER_TOKEN_EXP_DAYS;

    const token = jwt.sign(payloadToken, Config.JWT_SECRET);
    
    res
        .cookie(Config.COOKIE_NAME, token, { expires: new Date(payloadToken.exp), httpOnly: false })
        .status(200)
        .send({ 
            token,
            data: payloadToken
        });
}

export async function AutoLogin(req: Request, res: Response) {

    const user = await UserEntity.findById(req.query.id as string);

    if (user.apiToken !== req.query.token) {
        throw new createHttpError.Unauthorized(`Invalid credentials!`);
    }

    const isKioskView = user.getOptionalKey("isKioskView", false) as boolean;

    const payloadToken: AuthInfo = user.toJwtPayload();
    payloadToken.exp = Date.now() + 1000*24*60*60 * Config.DIRECT_TOKEN_EXP_DAYS;
    payloadToken.isKioskView = isKioskView;

    const token = jwt.sign(payloadToken, Config.JWT_SECRET);
    const respData = JSON.stringify({ 
        token,
        data: payloadToken
    }, null, 0);

    res
        .cookie(Config.COOKIE_NAME, token, { expires: new Date(payloadToken.exp), httpOnly: false })
        .status(200)
        .redirect(`/index.html?response=${Buffer.from(respData).toString('base64')}`);
}