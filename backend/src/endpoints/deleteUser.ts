import { Request, Response } from "express";
import * as Joi from 'joi';
import { UserEntity } from "../models/UserEntity";

export async function DeleteUser(req: Request, res: Response) {
    const id: number = Joi.attempt(req.params.id, Joi.number().min(1));

    const user = await UserEntity.findById(id);

    if (user.name === 'admin') {
        res.status(403).send({});
        return;
    }

    await UserEntity.destroy({ where: { id } });
    res.status(204).send({});
}