const User = require('../models/User');
const Favorite = require('../models/Favorite');
const GroceryListRecipe = require('../models/GroceryListRecipe');
var log = require('./logger.js');

module.exports = function(passport, Strategy){

    // Configure the local strategy for use by Passport.
    //
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new Strategy(
        async function(username, password, cb) {
            log.trace("[Passport Local] Entering local auth");
            const user = await User.byEmail(username);
            if( !user ) { 
                log.debug('[Passport Local] User with email ['+username+'] wasnt found. Redirecting.')
                return cb(null,false);
             }
            if( !user.correctPassword(password) ){ 
                log.debug('[Passport Local] Invalid Password for User with email ['+username+']. Redirecting.')
                return cb(null,false); 
            } 
            log.debug('[Passport Local] User with email ['+username+'] Authenticated Successfully!')
            return cb(null,user)

        }));
    
    
    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.
    passport.serializeUser(function(user, cb) {
        log.trace("[Passport seralizeUser] Entering serializeUser")
        cb(null, user.id);
    });
    
    passport.deserializeUser(async function(id, cb) {
        log.trace("[Passport deseralizeUser] Entering deserializeUser" + id)
        const user = await User.findOne({
            where: {
            id: id
            },
            include: [Favorite, GroceryListRecipe]
        });
        cb(null, user);
    });
};

