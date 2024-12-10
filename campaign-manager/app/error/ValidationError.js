class ValidationError extends Error{
    constructor(error, parameters) {
        super(error);
        this.params = parameters;
    }
}

module.exports = ValidationError;