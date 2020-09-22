import { Request, Response } from "express";
import { UserEntity } from "../models/UserEntity";

export async function ListUsers(req: Request, res: Response) {
    const users = await UserEntity.findAll();

    res.status(200).send({
        data: users.map((emp: UserEntity) => (emp.toExternal())),
        meta: {}
    });
}