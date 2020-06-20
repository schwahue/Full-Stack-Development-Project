const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

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
        clientID: "265980154753-7bh8t78b26o9ccs4h611k3unqaqd4lei.apps.googleusercontent.com",
        clientSecret: "K67H3PqwtMUqMFggp0X_NOlI",
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
                    console.log("USER FOUND");
                    console.log(user.id);
                    return done(null, user);
                }
            }).catch(err => console.log(err));
        
            /*
        User.findOne({ where: {email:profile.emails[0].value} })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No User Found' });
                }
                console.log("LOGIN ID");
                console.log(user.id);
                // Match password
                return done(null, user);
            });*/
            
        /*
        User.findOrCreate({
            where: { email: profile.emails[0].value },
            defaults: {
                googleId: profile.id,
            }, function (user) {
                console.log("HEEEEEEEEEEEEEEEEE");
                return done(null, user); }
        });*/

        //return done(null, profile);
        /*.then(user => {
            return cb(user);
        }).catch((err) => { // No user found, not stored in req.session
            console.log(err);
        });*/
        
    }
    

    ));

    // Serializes (stores) user id into session upon successful
    // authentication
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