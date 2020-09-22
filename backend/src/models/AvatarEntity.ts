import { Model, DataTypes } from 'sequelize';
import { getInstance } from '../storage';

const sequelize = getInstance();

export class AvatarEntity extends Model {

    id: number;
    image: Buffer;
    size: number;
    mime: string;
    createdAt: Date;
    updatedAt: Date;

}

AvatarEntity.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image: DataTypes.BLOB,
    size: DataTypes.NUMBER,
    mime: DataTypes.STRING,
}, { sequelize, modelName: 'employee_avatar' });
