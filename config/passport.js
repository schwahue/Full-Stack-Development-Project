const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const API_Keys = require('./API_Keys');

// Load user model
const User = require('../models/User_model');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function localStrategy(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (login_name, password,
        done) => {
            console.log("LOGIN NAME");
            console.log(login_name);
            User.findOne({ where: { [Op.or] : [ {contact_number:login_name}, {email:login_name}] } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No User Found' });
                }
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                })
            });

    }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        done(null, user.id); // user.id is used to identify authenticated user
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });
}

function MultiStrategy(passport){

    passport.use(new LocalStrategy({ usernameField: 'email' }, (login_name, password,
        done) => {
            console.log("LOGIN NAME");
            console.log(login_name);
            User.findOne({ where: { [Op.or] : [ {contact_number:login_name}, {email:login_name}] } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No User Found' });
                }
                else if (!user.password){
                    // we send a incorrect password as user signed up with google/twitter or facebook and
                    // no password is registered here, so in order not to leak too much info we send this.
                    return done(null, false, { message: 'Password incorrect' });
                }
                console.log("LOGIN ID");
                console.log(user.id);
                
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                })
            });

    }));

    passport.use(new GoogleStrategy({
        clientID: API_Keys.google.clientID,
        clientSecret: API_Keys.google.clientSecret,
        callbackURL: "http://localhost:5000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ where: { email: profile.emails[0].value} })
            .then(user => {
                if (!user) {
                    User.create({ email: profile.emails[0].value, googleId: profile.id, type: "customer" })
                    .then(user => {
                        console.log("CREATE USER");
                        console.log(user.id);
                    return done(null, user);
                    })
                    .catch(err => console.log(err));
                }
                else{
                    console.log("GOOGLE USER FOUND");
                    console.log(user.id);
                    if (!user.googleId){
                        user.update({
                            googleId: profile.id
                        })
                    }
                    return done(null, user);
                }
            }).catch(err => console.log(err));
        
        }));

    /*
    passport.use(new TwitterStrategy({
        consumerKey: API_Keys.twitter.consumerKey,
        consumerSecret: API_Keys.twitter.consumerSecret,
        callbackURL: "http://127.0.0.1:5000/auth/twitter/callback"
        },
        function(token, tokenSecret, profile, done) {
            /*
            User.findOrCreate({ twitterId: profile.id }, function (err, user) {
                return cb(err, user);
            });*/
            /*
            User.findOne({ where: { email: profile.emails[0].value} })
            .then(user => {
                if (!user) {
                    User.create({ email: profile.emails[0].value, googleId: profile.id, type: "customer" })
                    .then(user => {
                        console.log("CREATE USER");
                        console.log(user.id);
                    return done(null, user);
                    })
                    .catch(err => console.log(err));
                }
                else{
                    console.log("USER FOUND");
                    console.log(user.id);
                    return done(null, user);
                }
            }).catch(err => console.log(err));
        }
    ));*/
    // Serializes (stores) user id into session upon successful
    // authentication

    passport.use(new FacebookStrategy({
            clientID: API_Keys.facebook.clientID,
            clientSecret: API_Keys.facebook.clientSecret,
            callbackURL: "http://localhost:5000/auth/facebook/callback",
            profileFields: ['name', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            
            User.findOne({ where: { email: profile.emails[0].value} })
            .then(user => {
                if (!user) {
                    User.create({ email: profile.emails[0].value, faceebookId: profile.id, type: "customer" })
                    .then(user => {
                        console.log("CREATE FACEBOOK USER");
                        console.log(user.id);
                    return done(null, user);
                    })
                    .catch(err => console.log(err));
                }
                else{
                    console.log("USER FOUND FACEBOOK");
                    console.log(user.id);
                    if (!user.facebookId){
                        user.update({
                            facebookId: profile.id
                        })
                    }

                    return done(null, user);
                }
            }).catch(err => console.log(err));

        }
    ));


    passport.serializeUser((user, done) => {
        /*
        if (user.googleId){
            done(null, user.googleId);
        }
        else{
            done(null, user.id); // user.id is used to identify authenticated user
        }*/
        done(null, user.id); // user.id is used to identify authenticated user
    });

    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        
       /* User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });*/

        User.findOne({ where: { [Op.or] : [ {id:userId}, {googleId:userId}] }})
        .then((user) => {
            done(null, user); // user object saved in req.session
        })
        .catch((done) => { // No user found, not stored in req.session
            console.log(done);
        });
        
    });


}

module.exports = { localStrategy, MultiStrategy };