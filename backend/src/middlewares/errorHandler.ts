import { Request, Response, NextFunction } from "express";
import { debug } from 'debug';
import * as httpErrors from 'http-errors';
import { ValidationError } from "@hapi/joi";
import { MulterError } from "multer";

const logger = debug('app:errorHandler');

export function HandleErrors(err: Error, req: Request, res: Response, _: NextFunction) {
    logger(`Handle error for ${req.method} ${req.url}: ${err}`);

    let errorObj: httpErrors.HttpError = null;

    // Handle Joi validation errors
    if (err && err.name === 'ValidationError' && 'isJoi' in err) {
        const valError = err as ValidationError;
        const description = valError.details.map((val) => (val.message)).join(', ');
        errorObj = new httpErrors.BadRequest(description);
    }

    if (err && (
        (err.name === 'MulterError' && (err as MulterError).code === 'LIMIT_FILE_SIZE') ||
        (err.name === 'PayloadTooLargeError')
    )) {
        errorObj = new httpErrors.PayloadTooLarge(`Payload size not allowed!`);
    }

    if (err instanceof httpErrors.HttpError) {
        errorObj = err as httpErrors.HttpError;
    }

    // No error applyable yet ...
    if (!errorObj) {
        errorObj = new httpErrors.InternalServerError('Error could not be determined. See logs.');
    }

    // Send response
    res.status(errorObj.statusCode).send(errorObj.message);
}