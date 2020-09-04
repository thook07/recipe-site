
const log = require('./logger')

exports.ensureAdmin = function(options) {
    if (typeof options == 'string') {
      options = { redirectTo: options }
    }
    options = options || {};
    
    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
    
    return function(req, res, next) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            log.debug('User is not logged in. Redirecting...')
            if (setReturnTo && req.session) {
                req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
        } else {
            log.debug('User is logged in. Need to check to see if they are an admin');
            log.trace('User Role: ['+req.user.role+']')
            if(req.user.role != 'Admin') {
                log.debug('User is NOT Admin. Redirecting...');
                res.render('403-access-denied', {
                    user: req.user
                })
            }
        }
        next();
    }
  }

exports.ensureLoggedIn = function(options) {
    if (typeof options == 'string') {
      options = { redirectTo: options }
    }
    options = options || {};
    
    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
    
    return function(req, res, next) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        if (setReturnTo && req.session) {
          req.session.returnTo = req.originalUrl || req.url;
        }
        return res.redirect(url);
      }
      next();
    }
  }

