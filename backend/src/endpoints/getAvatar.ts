import { Request, Response } from "express";
import * as Joi from '@hapi/joi';
import { debug } from 'debug';
import { AvatarEntity } from "../models/AvatarEntity";
import createHttpError = require("http-errors");
import { EmployeeEntity } from "../models/Employee";

const logger = debug('app:getAvatar');

export async function GetAvatar(req: Request, res: Response) {

    Joi.attempt(req.params.id, Joi.number());

    const employee = await EmployeeEntity.findById(req.params.id, { attributes: ['avatarId'] });

    // Get the avatar
    const avatar = await AvatarEntity.findOne({
        where: {
            id: employee.avatarId
        }
    });

    if (!avatar) {
        throw new createHttpError.NotFound(`No such avatar!`);
    }

    logger(`Avatar #${req.params.id} requested: ${avatar.size} bytes, ${avatar.mime}`);

    res.status(200)
        .set({
            'Content-Type': avatar.mime,
            'Content-Length': `${avatar.size}`,
            'Content-Disposition': 'inline',
        })
        .send(avatar.image);
}