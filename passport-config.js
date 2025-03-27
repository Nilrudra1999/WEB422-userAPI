/*********************************************************************************
*  WEB422 – Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Nilrudra Mukhopadhyay   Student ID: 134061175   Date: 04/07/2025
*
********************************************************************************/
const passport = require("passport");
const passportJWT = require("passport-jwt");
const userService = require("./user-service");

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: "b074d478a78093c1306228095f22ed26fa3b45dec96694ef8622e32905afd4ee"
};

passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
    userService.getUserById(jwt_payload._id)
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, false));
}));

module.exports = passport;
