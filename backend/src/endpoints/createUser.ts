import { Request, Response } from "express";
import { Schema } from 'joi';
import * as Joi from 'joi';
import { debug } from 'debug';
import { UserEntity } from "../models/UserEntity";

const logger = debug('app:createUser');

interface RequestDto {
    name: string;
    roles: string[];
}

const MODEL: Schema = Joi.object().keys({
    name:       Joi.string().min(1).max(50).required(),
    roles:      Joi.array().items(Joi.string().min(1)).required(),
});

function getRandomString(len = 256): string {
    let str = '';
    while (str.length < len) {
        str += Math.random().toString(32).substring(2);
    }
    return str.substring(0, len);
}

export async function CreateUser(req: Request, res: Response) {

    // Validate input
    let dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });

    const user = await UserEntity.create({
        name: dto.name,
        roles: (dto.roles || []).join(','),
        optional: null,
        apiToken: getRandomString(256),
    });

    logger(`Created new user:`, user);

    res.status(201).send(user.toExternal());
}