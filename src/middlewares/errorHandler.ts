import { Request, Response, NextFunction } from 'express';
import { ErrorMessage } from 'src/core/errors/error.response';

const errorHandler = (err: ErrorMessage | Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);

    if (err instanceof ErrorMessage) {
        res.status(err.status).json({
            code: err.name,
            message: err.message,
            data: null
        });
    } else {
        res.status(500).json({
            code: err.name || 'internal_server_error',
            message: err.message || 'Internal Server Error',
            data: null
        });
    }
};

export default errorHandler;
