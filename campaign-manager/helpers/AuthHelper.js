
module.exports = {

    authenticate: function(req, res){
        var auth    = req.get('authorization');
        var token   = auth?auth.split(" ").pop():'';
        return true;
    }
    
}

