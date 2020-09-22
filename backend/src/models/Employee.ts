import { Model, DataTypes } from 'sequelize';
import { getInstance } from '../storage';
import { AvatarEntity } from './AvatarEntity';
import createHttpError = require('http-errors');
import { StateEntity, IDLE_STATE, ExternalStateEntity } from './ActivityEntity';

const sequelize = getInstance();

export interface ExternalEmployeeEntity {
    id: string;
    email: string;
    name: string;
    abbr: string;
    createdAt: string;
    updatedAt: string;
    avatarUrl: string | null;
    state: ExternalStateEntity;
}

export class EmployeeEntity extends Model {

    id: number;
    email: string;
    name: string;
    abbr: string;
    createdAt: Date;
    updatedAt: Date;
    avatarId: number;

    state?: StateEntity;

    toExternal(): ExternalEmployeeEntity {
        return {
            id: `${this.id}`,
            email: this.email,
            name: this.name,
            abbr: this.abbr,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            avatarUrl: this.avatarId > 0 ? `/api/employees/${this.id}/avatar?uid=${this.avatarId}` : null, 
            state: (!this.state ? IDLE_STATE : this.state).toExternal()
        };
    }

    static async findById(idRaw: string | number, opts?: object): Promise<EmployeeEntity> {
        const id = Number(idRaw);
        if (id < 1) {
            throw new createHttpError.BadRequest(`Bad employee id!`);
        }

        const employee = await EmployeeEntity.findOne({
            where: { id: `${id}` },
            ...(opts ? opts : {})
        });

        if (!employee) {
            throw new createHttpError.NotFound(`No such employee!`);
        }

        return employee;
    }

}

EmployeeEntity.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: DataTypes.STRING,
    name: {
        type: DataTypes.STRING,
        unique: true,
    },
    abbr: DataTypes.STRING,
}, { sequelize, modelName: 'employee' });

EmployeeEntity.belongsTo(AvatarEntity, { as: 'avatar', foreignKey: 'avatarId' });
EmployeeEntity.hasOne(StateEntity, { as: 'state', foreignKey: 'employeeId' });