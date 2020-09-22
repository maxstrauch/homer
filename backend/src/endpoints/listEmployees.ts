import { Request, Response } from "express";
import { Schema } from '@hapi/joi';
import * as Joi from '@hapi/joi';
import { debug } from 'debug';
import { EmployeeEntity } from "../models/Employee";
import { StateEntity } from "../models/ActivityEntity";
import { Op } from "sequelize";

const logger = debug('app:listEmployees');

interface RequestFilter {
    state: string;
    notState: string;
    stateChange: string;
}

const MODEL: Schema = Joi.object().keys({
    state: Joi.string().allow('HOMEOFFICE', 'CUSTOMER', 'OFFLINE').insensitive().only().optional(),
    notState: Joi.string().allow('HOMEOFFICE', 'CUSTOMER', 'OFFLINE').insensitive().only().optional(),
    stateChange: Joi.string().isoDate().optional(),
});

export async function ListEmployees(req: Request, res: Response) {
    const filter: RequestFilter = Joi.attempt(req.query, MODEL, { stripUnknown: true });
    // logger(`Filters:`, filter);

    const employees = await EmployeeEntity.findAll({
        where: {
        },
        include: [
            {
                model: StateEntity,
                as: 'state',
                ...(filter.state || filter.stateChange || filter.notState ? { 
                    where: { 
                        ...(filter.state ? { state: filter.state.toUpperCase() } : {}),
                        ...(filter.stateChange ? { updatedAt: { [Op.gt]: new Date(filter.stateChange) } } : {}),
                        ...(filter.notState ? { state: { [Op.ne]: filter.notState.toUpperCase() } } : {}),
                    } 
                } : { })
            }
        ],
        order: [[ 'name', 'ASC' ]],
    });

    res.status(200).send({
        data: employees.map((emp: EmployeeEntity) => (emp.toExternal())),
        meta: {}
    });
}