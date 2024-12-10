module.exports = {
    base64: function(value) {
        if(value) {
            return Buffer.from(value).toString('base64');
        }
        return false;
    }
};