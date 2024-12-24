const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// ...existing code...

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // ...existing code...
  }
));

// Serialize user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(function(id, done) {
  // ...existing code...
});

// Set session expiration time to 5 minutes
passport.session = {
  cookie: {
    maxAge: 5 * 60 * 1000 // 5 minutes in milliseconds
  }
};
