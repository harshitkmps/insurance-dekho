var errors  = require('../config/errors');

module.exports = {
        
    formatError: function(code, field, message = '', detail = ''){
        var error = {};
        if(!message){
            message = errors[code]?errors[code]:ERROR.DEFAULT_ERROR;
        }
        error.code      = code;
        error.field     = field;
        error.message   = message; 
        error.detail    = detail; 
        return error;
    },

    formatErrors: function(code, field, message = '', detail = ''){
        let errors = new Array();
        let error = this.formatError(code, field, message, detail);
        errors.push(error);
        return errors;
    }
}