import { Request, Response } from "express";
import { Schema } from 'joi';
import * as Joi from 'joi';
import { EmployeeEntity } from "../models/Employee";
import { debug } from 'debug';
import { dispatchAction } from "../webhooks";

const logger = debug('app:deleteEmployee');

interface RequestDto {
    email: string;
    name: string;
    abbr: string;
}

const MODEL: Schema = Joi.object().keys({
    email:  Joi.alternatives(Joi.string().allow(null), Joi.string().allow(""), Joi.string().min(1).max(100).email()).optional(),
    name:   Joi.alternatives(Joi.string().min(1).max(50), null).optional(),
    abbr:   Joi.alternatives(Joi.string().min(1).max(10), null).optional(),
});

export async function UpdateEmployee(req: Request, res: Response) {
    // let dto: RequestDto = Joi.attempt(req.body, MODEL, { stripUnknown: true });

    let dto: RequestDto = req.body as RequestDto;

    const id: number = Joi.attempt(req.params.id, Joi.number().min(1));

    await EmployeeEntity.update(
        dto,
        {
            where: { id: `${id}` }
        }
    );

    res.status(200).send((await EmployeeEntity.findById(id)).toExternal());

    try {
        dispatchAction(
            'EmployeeUpdated',
            {
                iat: (new Date()).toISOString(),
                employeeId: id,
            }
        );
    } catch (ex) {
        // Remain silent to the user
        logger(`Dispatching webhook failed:`, ex);
    }
}