import { Response } from "express";
import * as Joi from 'joi';
import { Schema } from 'joi';
import { debug } from 'debug';
import { UserEntity } from "../models/UserEntity";
import { hasRole } from "../middlewares/hasRole";
import { AuthenticatedRequest } from "../models/AuthenticatedRequest";
import { Roles } from "../models/Roles";
import createHttpError = require("http-errors");

const logger = debug('app:changePassword');

interface RequestDto {
    newPassword: string;
    password?: string;
}

const MODEL: Schema = Joi.object().keys({
    newPassword: Joi.string().min(1).max(150).required(),
    password:    Joi.alternatives(Joi.string().allow(""), Joi.string().min(1).max(150)).optional(),
});

export async function ChangePassword(req: AuthenticatedRequest, res: Response) {

    // Validate input
    const dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });
    
    const user = await UserEntity.findById(req.params.id);

    logger(`Change password for ${user.name} (${user.id})`);

    if (!hasRole(req, Roles.ADMIN)) {
        if (req.auth.id != req.params.id) {
            throw new createHttpError.BadRequest(`Can only change own password!`);
        }

        await user.requireValidPassword(dto.password);
    } else {
        const currentUser = await UserEntity.findById(req.auth.id);
        await currentUser.requireValidPassword(dto.password);
    }

    await user.setPassword(dto.newPassword);

    res.status(201).send({});
}