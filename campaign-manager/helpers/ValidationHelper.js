var path = require('path');
var commonHelper = require('./CommonHelper');

var defaultMessage = {
    required:'is required',
    email: 'is invalid',
    mobile: 'is invalid',
    date: 'is invalid',
    number: 'should be number',
    alphaNumeric: 'should be alpha numeric'
};

module.exports = {
    
    validate: function(rulesData, data){
        var isValid = true;
        var errors = [];
        for (var key in rulesData) {
            if (rulesData.hasOwnProperty(key)) {
                var rules = rulesData[key];
                for(var i=0; i < rules.length; i++){ 
                    var rule = rules[i];
                    if(key.indexOf('.') > -1){
                        var value = getNestedKeyValue(key, data);
                    }else{
                        var value= data && data[key]?data[key]:null;
                    }
                    if(typeof rule == 'object'){
                        isValid = module.exports[rule.rule](value, rule);                  
                    }else{
                        isValid = module.exports[rule](value);
                    }
                    if(!isValid){
                        var message = rule.message?rule.message:key + ' ' +defaultMessage[rule];
                        var error = commonHelper.formatError('B2C400', key, message);
                        errors = errors.concat(error);
                    }
                }
            }
        }
        return errors;
    },

    getNestedKeyValue: function(key, obj) {
        var i=0;
        var keys = key.split('.');
        var value = obj[keys[i]];
        if (value && typeof value === 'object') {
            key = key.substring(key.indexOf('.')+1);
            i++;
            return getNestedKeyValue(key, value);
        }
        return value;
    },

    validateRegistrationNumber: function(value){ 
        return value.length <= config.registrationNumberMaxLength;
    },

    validateLength: function(value){ 
        return function  (v) {
            if(v === 0 || v === '0'){
                return true;
            }
            if(typeof v == 'number'){
                v = v.toString();   
            }
            if (v && v.length) {
                return v.toString().length == value;
            }
        }
    },

    validateFileType: function(files, allowedFileTypes) {
        if(files){
            for(var i=0; i<files.length; i++){
                var extFound = false;
                var ext = path.extname(files[i].filename).substring(1).toLowerCase();
                if(allowedFileTypes){
                    for(var key=0; key<allowedFileTypes.length; key++){
                        var allowedExt = allowedFileTypes[key].toLowerCase();
                        if(ext === allowedExt){
                            extFound = true;
                            break;
                        }
                    }
                    if(!extFound){
                        return false;
                    }
                }
            }        
        }
        return true;
    },

    email: function(value) {
        if(!value){
            return true;
        }  
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(value);
    },

    mobile: function(value) {
        if(!value){
            return true;
        }  
        var regex =  /^[6-9][0-9]{9}$/;
        return regex.test(value);
    },

    date: function(value){
        var regex = /^\d{4}-\d{2}-\d{2}$/;
        var timestamp = Date.parse(value);
        if(!value){
            return true;
        }        
        if (value.match(regex) && !isNaN(timestamp)) {
            return true;
        }
        return false;
    },

    length: function(value, rule){ 
        if(!value || (value.length >= rule.min && value.length <=  rule.max)){
            return true;
        }  
        return false;
    },

    number: function(value){ 
        if(isNaN(value)){
            return false;
        } 
        return true;
    },

    alphaNumeric: function(value){ 
        var regex = /^[a-zA-Z0-9]+$/;
        return regex.test(value);
    },

    required: function(value){
        if(value){
            return true;
        }
        return;
    }
    
}
