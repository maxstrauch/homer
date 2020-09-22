import { Request, Response } from "express";
import { Schema } from '@hapi/joi';
import * as Joi from '@hapi/joi';
import { debug } from 'debug';
import { EmployeeEntity } from "../models/Employee";
import { StateEntity } from "../models/ActivityEntity";
import { dispatchAction } from "../webhooks";

const logger = debug('app:changeEmployeeState');

interface RequestDto {
    state: 'HOMEOFFICE' | 'CUSTOMER' | 'PAUSE' | 'OFFLINE';
    description: string;
}

const MODEL: Schema = Joi.object().keys({
    state: Joi.string().allow('HOMEOFFICE', 'PAUSE', 'CUSTOMER', 'OFFLINE').insensitive().only().required(),
    description: Joi.alternatives(Joi.string().min(1).max(1000), Joi.string().allow("")).optional()
});

export async function ChangeEmployeeState(req: Request, res: Response) {

    const dto: RequestDto = Joi.attempt({
        ...req.body,
        ...req.query
    }, MODEL, { stripUnknown: true });

    const employee = await EmployeeEntity.findById(req.params.id);

    logger(`Change state for ${employee.name} (${employee.id}) to: ${dto.state}`);

    let act = await StateEntity.findOne({ where: { employeeId: employee.id } });

    const oldState = act ? act.state : null;

    logger(`Old state: ${oldState}`);

    if (!act) {
        logger(`No activity yet ...`);
        act = await StateEntity.create({
            employeeId: employee.id,
            state: dto.state,
            description: dto.description || null,
        });
    } else {
        act.state = dto.state;
        act.description = dto.description || null;
        await act.save();
    }

    try {
        dispatchAction(
            'EmployeeStateChange',
            {
                iat: (new Date()).toISOString(),
                oldState,
                newState: dto.state,
                description: dto.description,
                employee: employee.toExternal()
            }
        );
    } catch (ex) {
        // Remain silent to the user
        logger(`Dispatching webhook failed:`, ex);
    }

    res.status(200).send({});
}