import { Request, Response } from "express";
import { EmployeeEntity } from "../models/Employee";
import { StateEntity } from "../models/ActivityEntity";
import createHttpError from "http-errors";

export async function GetEmployeeById(req: Request, res: Response) {

    const employee = await EmployeeEntity.findOne({
        where: {
            id: req.params.id,
        },
        include: [
            {
                model: StateEntity,
                as: 'state',
            }
        ],
    });

    if (!employee) {
        throw new createHttpError.NotFound(`No such employee!`);
    }

    res.status(200).send({
        data: employee.toExternal(),
        meta: {}
    });
}