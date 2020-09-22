import { Request, Response } from "express";
import * as Joi from '@hapi/joi';
import { EmployeeEntity } from "../models/Employee";
import { debug } from 'debug';
import { dispatchAction } from "../webhooks";

const logger = debug('app:deleteEmployee');

export async function DeleteEmployee(req: Request, res: Response) {
    const id: number = Joi.attempt(req.params.id, Joi.number().min(1));
    await EmployeeEntity.destroy({ where: { id } });
    res.status(204).send({});

    try {
        dispatchAction(
            'EmployeeDeleted',
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