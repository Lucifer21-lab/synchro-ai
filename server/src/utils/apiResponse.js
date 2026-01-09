class ApiResponse {
    constructor(data, message = 'Success', statusCode = 200) {
        this.success = true;
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
    }
}

class ApiError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.success = false;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { ApiResponse, ApiError };
