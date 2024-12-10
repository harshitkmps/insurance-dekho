class DatabaseError extends Error{
    constructor(message, type, errorObject) {
        super(message);
        this.type = type;
        this.error = errorObject;
        console.error(`database error. message: ${message} , type: ${type}, error: ${JSON.stringify(this.error)}`);
    }
}

module.exports = DatabaseError;