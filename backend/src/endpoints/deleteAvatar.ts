import { Request, Response } from "express";
import * as Joi from 'joi';
import { AvatarEntity } from "../models/AvatarEntity";
import { EmployeeEntity } from "../models/Employee";

export async function DeleteAvatar(req: Request, res: Response) {

    Joi.attempt(req.params.id, Joi.number());

    const employee = await EmployeeEntity.findById(req.params.id);

    if (employee.avatarId < 1) {
        res.status(200).send({});
        return;
    }

    // Get the avatar
    await AvatarEntity.destroy({ where: { id: employee.avatarId } });

    employee.avatarId = null;
    await employee.save();

    res.status(204).send({});
}