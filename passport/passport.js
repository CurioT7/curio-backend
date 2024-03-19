const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const { webSignup } = require("../controller/Auth/SocialsController");

/**
 * Configure passport middleware for authentication with Google OAuth.
 * @param {Object} passport - Passport.js instance.
 */
module.exports = async function (passport) {
  /**
   * Serialize the user object into the session.
   * @param {Object} user - User object.
   * @param {Function} done - Callback function.
   */
  passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize the user ID into the session
  });

  /**
   * Deserialize the user object from the user ID.
   * @param {string} id - User ID.
   * @param {Function} done - Callback function.
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Deserialize the user object from the user ID
    } catch (error) {
      done(error, false);
    }
  });

  /**
   * Configure Google authentication strategy.
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
        scope: ["email", "profile"],
      },

      /**
       * Google authentication callback function.
       * @param {string} accessToken - Access token provided by Google.
       * @param {string} refreshToken - Refresh token provided by Google.
       * @param {Object} profile - User profile object returned by Google.
       * @param {Function} done - Callback function.
       */
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
};
