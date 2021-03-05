import { Request, Response } from "express";
import { Schema } from 'joi';
import * as Joi from 'joi';
import { debug } from 'debug';
import { UserEntity } from "../models/UserEntity";

const logger = debug('app:changeUser');

interface RequestDto {
    name?: string;
    roles?: string[];
    optional?: { [key: string]: string | number | boolean; };
}

const MODEL: Schema = Joi.object().keys({
    name:       Joi.string().min(1).max(50).optional(),
    roles:      Joi.array().items(Joi.string().min(1)).optional(),
    optional:   Joi.object().optional(),
});

export async function ChangeUser(req: Request, res: Response) {

    // Validate input
    let dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });
    const user = await UserEntity.findById(req.params.id);

    if (user.name === 'admin') {
        res.status(403).send({});
        return;
    }

    logger("Change user:", dto, req.params.id);

    user.name = dto.name || user.name;    
    user.roles = dto.roles ? dto.roles.join(',') : user.roles;
    user.optional = JSON.stringify({
        ...user.getOptionalJson(),
        ...(dto.optional ? dto.optional : {})
    });

    await user.save();

    res.status(201).send(user.toExternal());
}