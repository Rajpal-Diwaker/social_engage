let passport = require('passport'),
    Strategy = require('passport-facebook').Strategy,
    config = require('../Utilities/config').config;

passport.use(new Strategy({
    clientID:config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: '/return'
  },
  function(accessToken, refreshToken, profile, cb) {
      // In this example, the user's Facebook profile is supplied as the user
      // record.  In a production-quality application, the Facebook profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      const obj={
          accessToken:accessToken,
          profile:profile
        }
    console.log("HHHHHHHHHHHHHHHHHHHHHH",accessToken)
    return cb(null, obj);
  }));
  passport.serializeUser(function(user, cb) {
    console.log("FFFFFFFFFFFFFFFFFFFFFF",user)
    cb(null, user);
  });
  passport.deserializeUser(function(obj, cb) {
    console.log("WWWWWWWWWWWWWWWWWWWWWW",obj)
    cb(null, obj);
  });