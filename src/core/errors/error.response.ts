// Định nghĩa mã trạng thái lỗi như một đối tượng
const ErrorResponseStatus = {
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 401,
};


// Base Error Class
class ErrorMessage extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'ErrorMessage';
    }
}

// Các lỗi cụ thể
class ForbiddenError extends ErrorMessage {
    constructor(message: string) {
        super(message, ErrorResponseStatus.FORBIDDEN);
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends ErrorMessage {
    constructor(message: string) {
        super(message, ErrorResponseStatus.NOT_FOUND);
        this.name = 'NotFoundError';
    }
}

class BadRequestError extends ErrorMessage {
    constructor(message: string) {
        super(message, ErrorResponseStatus.BAD_REQUEST);
        this.name = 'BadRequestError';
    }
}

class InternalServerError extends ErrorMessage {
    constructor(message: string) {
        super(message, ErrorResponseStatus.INTERNAL_SERVER_ERROR);
        this.name = 'InternalServerError';
    }
}

class UnauthorizedError extends ErrorMessage {
    constructor(message: string) {
        super(message, ErrorResponseStatus.UNAUTHORIZED);
        this.name = 'UnauthorizedError';
    }
}

export {
    ErrorMessage,
    ForbiddenError,
    NotFoundError,
    BadRequestError,
    InternalServerError,
    UnauthorizedError,
    ErrorResponseStatus
}
