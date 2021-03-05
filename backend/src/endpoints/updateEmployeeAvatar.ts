import { Response } from "express";
import * as Joi from 'joi';
import { debug } from 'debug';
import { EmployeeEntity } from "../models/Employee";
import createHttpError = require("http-errors");
import { AvatarEntity } from "../models/AvatarEntity";
import { hasRole } from "../middlewares/hasRole";
import sharp from "sharp";
import * as fs from "fs-extra";
import { AuthenticatedRequest } from "../models/AuthenticatedRequest";
import { Roles } from "../models/Roles";
import { dispatchAction } from "../webhooks";

const logger = debug('app:updateEmployeeAvatar');

export async function UpdateEmployeeAvatar(req: AuthenticatedRequest & { file: Express.Multer.File; }, res: Response) {

    if (!req.file || req.file.size < 1) {
        throw new createHttpError.BadRequest(`No such file!`);
    }

    if (!hasRole(req, Roles.USER)) {
        // Delete file from disk
        logger(`File on disk: ${req.file.path} (${req.file.filename})`);
        fs.unlinkSync(req.file.path);
        
        throw new createHttpError.Unauthorized(`Cannot upload!`);
    }

    Joi.attempt(req.params.id, Joi.number());

    const employee = await EmployeeEntity.findOne({
        where: { id: req.params.id }
    });

    if (!employee) {
        throw new createHttpError.NotFound(`No such employee!`);
    }

    // Process the file ...
    const rawBuf = fs.readFileSync(req.file.path);

    const fileBuf = await sharp(rawBuf)
        .rotate()
        .resize(400)
        .jpeg()
        .toBuffer();

    logger(`Read file ${req.file.path}, ${rawBuf.length}`);
    logger(`reduced to ${fileBuf.length}`);
    logger(`Original file:`, req.file);

    // Delete file from disk
    logger(`File on disk: ${req.file.path} (${req.file.filename})`);
    fs.unlinkSync(req.file.path);

    const avatar = await AvatarEntity.create({
        image: fileBuf,
        size: fileBuf.length,
        mime: 'image/jpg',
    });

    // Delete the old avatar
    if (employee.avatarId) {
        logger(`Remove linked old avatar: #${employee.avatarId}`);

        await AvatarEntity.destroy({
            where: { id: employee.avatarId }
        });
    }

    employee.avatarId = avatar.id;
    await employee.save();

    res.status(201).send(employee.toExternal());

    try {
        dispatchAction(
            'EmployeeUpdated',
            {
                iat: (new Date()).toISOString(),
                employee: employee.toExternal(),
            }
        );
    } catch (ex) {
        // Remain silent to the user
        logger(`Dispatching webhook failed:`, ex);
    }

}