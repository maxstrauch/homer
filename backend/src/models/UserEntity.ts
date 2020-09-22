import { Model, DataTypes } from 'sequelize';
import { getInstance } from '../storage';
import createHttpError from 'http-errors';
import { AuthInfo } from './AuthenticatedRequest';
import * as crypto from 'crypto';

async function pbkdf2(secret: string, saltInput: (string | null) = null): Promise<string> {
    const salt = saltInput || (
        Math.random().toString(32).substring(2, 12) +
        Math.random().toString(32).substring(2, 12)
    );
    return new Promise<string>((resolve: any, reject: any) => {
        crypto.pbkdf2(secret, salt, 100000, 256, 'sha256', (err: any, key: any) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(`${salt}:${key.toString('hex')}`);
        });
    });
}

const sequelize = getInstance();

export class UserEntity extends Model {

    id: number;
    name: string;
    password: string;
    roles: string;
    failedLogins: number;
    apiToken: string;
    optional: string | null;

    private _parsedOptional: { [key: string]: string | number | boolean; } = null;

    async isValidPassword(password: string): Promise<boolean> {
        const actualPasswordParts = (this.password || '').split(':');
        if (actualPasswordParts.length != 2) {
            return false;
        }
        const hashedPassword = await pbkdf2(password, actualPasswordParts[0]);
        return hashedPassword === this.password;
    }

    async requireValidPassword(password: string): Promise<void> {
        if (!(await this.isValidPassword(password))) {
            throw new createHttpError.Unauthorized(`Wrong password`);
        }
    }

    async setPassword(password: string): Promise<void> {
        this.password = await pbkdf2(password);
        await this.save();
    }

    getOptionalJson(): { [key: string]: string | number | boolean; } {
        if (!this._parsedOptional) {
            try {
                this._parsedOptional = JSON.parse(this.optional) || {};
            } catch (_) { }
        }
        return this._parsedOptional;
    }

    getOptionalKey(key: string, defaultValue: number | string | boolean): number | string | boolean {
        this.getOptionalJson();
        return !(key in this._parsedOptional) ? defaultValue : this._parsedOptional[key];
    }

    getRoles(): string[] {
        return (this.roles || '').split(',');
    }

    toExternal() {
        return {
            id: this.id,
            name: this.name,
            roles: this.getRoles(),
            directLoginUrl: this.apiToken ? `autologin/?id=${this.id}&token=${this.apiToken}` : null,
            optional: this.getOptionalJson(),
        };
    }

    toJwtPayload(): AuthInfo {
        return {
            id: `${this.id}`,
            name: this.name,
            roles: this.getRoles()
        };
    }

    toString(): string {
        return `User{name=${this.name},id=${this.id},failedLogins=${this.failedLogins}}`;
    }

    static async findUserByCredentials(name: string, password: string): Promise<[UserEntity | null, number]> {

        const user = await UserEntity.findOne({
            where: { name: name }
        });

        if (!user) {
            return [null, 0];
        }

        if (!(await user.isValidPassword(password))) {
            user.failedLogins += 1;
        } else {
            user.failedLogins = 0;
        }

        await user.save();

        if (user.failedLogins > 0) {
            return [null, 3];
        }
        
        return [user, user.failedLogins];
    }

    static async findById(idRaw: string | number, opts?: object): Promise<UserEntity> {
        const id = Number(idRaw);
        if (id < 1) {
            throw new createHttpError.BadRequest(`Bad user id!`);
        }

        const user = await UserEntity.findOne({
            where: { id: `${id}` },
            ...(opts ? opts : {})
        });

        if (!user) {
            throw new createHttpError.NotFound(`No such user!`);
        }

        return user;
    }

}

UserEntity.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
    },
    password: DataTypes.STRING,
    roles: DataTypes.STRING,
    apiToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    failedLogins: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0
    },
    optional: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, { sequelize, modelName: 'users' });

UserEntity.addHook('afterSync', async () => {
    if (! (await UserEntity.findOne({ where: { name: 'admin' } }))) {
        
        const initialPwd = Math.random().toString().substr(4, 10);
        const hash = await pbkdf2(initialPwd);

        await UserEntity.create({
            name: 'admin',
            password: hash,
            roles: '*',
            apiToken: null,
            optional: null
        });

        console.log("------")
        console.log("CREATED INITIAL USER")
        console.log("------")
        console.log(`Name: admin, Password: ${initialPwd}`);
    }
});