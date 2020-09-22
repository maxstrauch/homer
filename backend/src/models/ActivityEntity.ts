import { Model, DataTypes } from 'sequelize';
import { EmployeeEntity } from './Employee';
import { getInstance } from '../storage';

const sequelize = getInstance();


export enum States {
    HOMEOFFICE = 'HOMEOFFICE', 
    PAUSE = 'PAUSE', 
    CUSTOMER = 'CUSTOMER', 
    OFFLINE = 'OFFLINE'
}

export interface ExternalStateEntity {
    state: string;
    description: string;
    updatedAt: string;
}

export class StateEntity extends Model {

    id: number;
    employeeId: number;

    state: 'HOMEOFFICE' | 'CUSTOMER' | 'PAUSE' | 'OFFLINE';
    description: string | null;

    employee?: EmployeeEntity;

    createdAt: Date;
    updatedAt: Date;


    toExternal(): ExternalStateEntity {
        return {
            state: this.state.toUpperCase(),
            description: this.description || null,
            updatedAt: this.updatedAt.toISOString(),
        };
    }

}

StateEntity.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    state: DataTypes.STRING,
    description: DataTypes.STRING,
}, { sequelize, modelName: 'employee_state' });


export const IDLE_STATE: StateEntity = new StateEntity();
IDLE_STATE.state = 'OFFLINE';
IDLE_STATE.description = null;
IDLE_STATE.updatedAt = new Date();