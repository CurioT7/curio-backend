const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const { webSignup } = require("../controller/Auth/webSocialsController");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize the user ID into the session
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Deserialize the user object from the user ID
    } catch (error) {
      done(error, false);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
        scope: ["email", "profile"],
      },

      async (accessToken, refreshToken, profile, done) => {
        if (!profile) {
          return done(null, false);
        }
        let socialMediaType = "google";
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // If user exists, sign in
          return done(null, user);
        } else {
          // If user does not exist, sign up
          try {
            user = await webSignup(profile, socialMediaType);
            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      }
    )
  );

  // TODO: Add Facebook Strategy
};
