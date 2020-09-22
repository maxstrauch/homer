import { Request, Response } from "express";
import { Schema } from '@hapi/joi';
import * as Joi from '@hapi/joi';
import { debug } from 'debug';
import { EmployeeEntity } from "../models/Employee";
import createHttpError = require("http-errors");
import { dispatchAction } from "../webhooks";

const logger = debug('app:createEmployee');

interface RequestDto {
    email: string;
    name: string;
    abbr: string;
}

const MODEL: Schema = Joi.object().keys({
    email:  Joi.alternatives(Joi.string().allow(null), Joi.string().allow(""), Joi.string().min(1).max(100).email()).optional(),
    name:   Joi.string().min(1).max(50).required(),
    abbr:   Joi.alternatives(Joi.string().allow(null), Joi.string().allow(""), Joi.string().min(1).max(10)).optional(),
});

function computeAbbr(name: string): string {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (`${parts[0].substring(0, 1)}${parts[1].substring(0, 1)}`).toUpperCase();
    } else {
        return (`${parts[0].substring(0, 2)}`).toUpperCase();
    }
}

export async function CreateEmployee(req: Request, res: Response) {

    // Validate input
    let dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });

    if (!dto.abbr) {
        dto.abbr = computeAbbr(dto.name);
    }

    let employee: EmployeeEntity;
    try {
        employee = await EmployeeEntity.create({
            ...dto,
        });
    } catch (ex) {
        if (ex.name === 'SequelizeUniqueConstraintError') {
            throw new createHttpError.Conflict(`A user already exists with this name!`);
        } else {
            throw ex;
        }
    }

    logger(`Created new employee:`, employee);

    try {
        dispatchAction(
            'EmployeeCreated',
            {
                iat: (new Date()).toISOString(),
                employee: employee.toExternal()
            }
        );
    } catch (ex) {
        // Remain silent to the user
        logger(`Dispatching webhook failed:`, ex);
    }

    res.status(201).send(employee.toExternal());
}