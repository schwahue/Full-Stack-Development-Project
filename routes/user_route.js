const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
var bcrypt = require('bcryptjs');

const User = require('../models/User_model');
const passport = require('passport');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//HF Test Code
router.get('/login', (req, res) => {
    
    if (res.locals.user){
        res.redirect('/user/redirect');
    }
    else {
        res.render('user/login', {title:"login", style:"login_form"}); 
    }

    
});

router.post('/login', (req, res, next) => {
    
    passport.authenticate('local', {
        successRedirect: '/user/redirect', // Route to /user/account URL
        failureRedirect: '/user/login', // Route to /login URL
        failureFlash: true
        /* Setting the failureFlash option to true instructs Passport to flash an error message using the
        message given by the strategy's verify callback, if any. When a failure occur passport passes the message
        object as error */
    })(req, res, next);

});

router.get('/choose_account', (req, res) => {
    
    res.render('user/choose_account',  {title:"Choose Account", style:"signup_form"}); 

});

router.get('/signup', (req, res) => {

    res.render('user/sign_up',  {title:"Sign Up", style:"signup_form"}); 

});

router.post('/signup', (req, res) => {

    // TEST
    let errors = [];

    // Retrieves fields from register page from request body
    let { username, email, password, c_password , last_name, first_name  } = req.body;

    
    // Checks if both passwords entered are the same
    if (password !== c_password) {
        errors.push('Passwords do not match' );
    }

    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push('Password must be at least 4 characters' );
    }

    if (errors.length > 0) {
        res.render('user/sign_up',  {
            title:"Sign Up", 
            style:"signup_form", 
            first_name, 
            last_name,
            username,
            email,
            errors
        
        }); 

    } 
    else  {
        
        console.log("no errors");
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/sign_up',  {
                        error: 'email: ' + user.email + ' already registered',
                        title:"Sign Up", 
                        style:"signup_form", 
                        first_name, 
                        last_name,
                        username,
                        email
                    
                    }); 

                } else {
                    User.findOne({ where: { username: req.body.username } })
                    .then(user2 =>{
                        if (user2) {
                            res.render('user/sign_up',  {
                                error: 'username: ' + user2.username + ' already in use',
                                title:"Sign Up", 
                                style:"signup_form", 
                                first_name, 
                                last_name,
                                username,
                                email
                            
                            });

                        } else {
                            // Create new user record
                            let type = 'customer';
                            bcrypt.genSalt(10, function(err, salt) {
                                if (err) return next(err);
                                bcrypt.hash(password, salt, function(err, hash) {
                                    if (err) return next(err);
                                    
                                    password = hash;
                                    
                                    User.create({ first_name, last_name, email, password, username, type })
                                        .then(user => {
                                            alertMessage(res, 'success', user.username + ' added. Please login', 'fas fa-sign-in-alt', true);
                                            res.redirect('/user/login');
                                        })
                                        .catch(err => console.log(err));
                                    
                                });
                            });
                        }

                    });
                        
                        
                    
                }
            });
            
            


    }

    
});


router.get('/delivery', (req, res)=> {

    res.render('user/delivery', {title:"delivery", style:"users"});

});


// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/account', (req, res) => {
    console.log("HEHEHEHEHEHEh");
    console.log(res.locals.user.type);
	res.render('user/account', { style:"users"});
});

router.get('/redirect', (req, res) => {

    if (res.locals.user){
        if (res.locals.user.type == "customer"){
            res.redirect('/user/account');
        }
        else if(res.locals.user.type == "admin"){
            res.redirect('/admin/account');
        }
        else if(res.locals.user.type == "merchant"){
            res.redirect('/merchant/account');
        }
    }
    else{
        res.redirect('/user/login');
    }

});


//HF Test code End



module.exports = router;