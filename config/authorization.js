
const log = require('./logger')

exports.protected = function(req, res){
    log.trace('[protected] User:' + JSON.stringify(req.user));
    if( req.user && req.user.role == 'Admin' ){
        return
    } else {
        res.render('403-access-denied');
    }
}