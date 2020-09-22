// @ts-ignore:next-line
require('sqlite3');

import { Sequelize } from 'sequelize';
import { debug } from "debug";
import * as path from 'path';
import { Config } from "./config";

const logger = debug("app:storage");

let SQ: Sequelize = null;

const sqliteFile = path.join(process.cwd(), Config.SQLITE_FILE_PATH);

logger(`cwd=${process.cwd()}, __dirname=${__dirname}`);
logger(`sqliteFile=${sqliteFile}`);

SQ = new Sequelize(
    `sqlite://${sqliteFile}`,
    {
        logging: process.env.DEBUG_SQLITE ? (sql: string) => {
            logger(sql);
        } : false
    }
);

export async function initStorage() {
    logger(`Trying to (re)create tables ...`);

    try {
        await SQ.sync();
    } catch (ex) {
        console.error("Failed to initialize the database:");
        console.error(ex);
        console.error("Exiting!");
        process.exit(1);
    }
}

export function getInstance(): Sequelize {
    if (!SQ) {
        console.error("Database has not been opened before hand! Exiting!");
        process.exit(1);
    }

    return SQ;
}
