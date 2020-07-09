const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
var bcrypt = require('bcryptjs');

const User = require('../models/User_model');
const passport = require('passport');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ensureAuthenticated = require('../helpers/auth');

var admin = require('firebase-admin');
var firebase = require("firebase/app");
const { ensureUserAuthenticated } = require('../helpers/auth');
require("firebase/auth");
require("firebase/firestore");

//HF Test Code
router.get('/login', (req, res) => {
    
    if (res.locals.user){
        res.redirect('/user/redirect');
    }
    else {
        res.render('user/login', {title:"login", style:"login_form"}); 
    }

    
});
/*
router.get('/createtoken', (req, res) => {
    user = req.user;
    let uid = user.email;

    admin.auth().createCustomToken(uid)
    .then(function(customToken) {
        req.session.token = customToken;
        firebase.auth().signInWithCustomToken(customToken).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('Error SIGNING IN custom token:', error);
            
            
        });
        console.log("SIGNED IN WITH TOKEN");
        res.redirect('/user/redirect');
    })
    .catch(function(error) {
        console.log('Error creating custom token:', error);
    });
    

    
});*/

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
    
    res.render('user/choose_account',  {title:"Choose Account", style:"choose_acc"}); 

});
/*
router.get('/signup', (req, res) => {

    res.render('user/sign_up',  {title:"Sign Up", style:"signup_form"}); 

});*/

router.get('/signup', (req, res) => {

    res.render('user/sign_up2',  {title:"Sign Up", style:"login_form"}); 

});

router.post('/signup', (req, res) => {

    // TEST
    let errors = [];

    // Retrieves fields from register page from request body
    let { contact_number, email, password, c_password , last_name, first_name  } = req.body;

    
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
            contact_number,
            email,
            errors
        
        }); 

    } 
    else  {
        
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    /*
                    res.render('user/sign_up',  {
                        error: 'email: ' + user.email + ' already registered',
                        title:"Sign Up", 
                        style:"signup_form", 
                        first_name, 
                        last_name,
                        username,
                        email
                    
                    }); */
                    errors.push('email: ' + user.email + ' already registered ' );
                    

                } 

                User.findOne({ where: { contact_number: req.body.contact_number } })
                .then(user2 =>{
                    if (user2)  {
                        errors.push('contact_number: ' + user2.contact_number + ' already in use' );
                        res.render('user/sign_up',  {
                            errors,
                            title:"Sign Up", 
                            style:"signup_form", 
                            first_name, 
                            last_name,
                            contact_number,
                            email
                        
                        });

                    } else {
                        if(errors.length > 0){
                            res.render('user/sign_up',  {
                                errors,
                                title:"Sign Up", 
                                style:"signup_form", 
                                first_name, 
                                last_name,
                                contact_number,
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
                                    
                                    User.create({ first_name, last_name, email, password, contact_number, type })
                                        .then(user => {
                                            alertMessage(res, 'success', user.email + ' added. Please login', 'fas fa-sign-in-alt', true);
                                            res.redirect('/user/login');
                                        })
                                        .catch(err => console.log(err));
                                    
                                });
                            });
                        }
                    }

                });
                        
                        
                    
                
            });
            
            


    }

    
});


router.get('/delivery', (req, res)=> {

    res.render('user/delivery', {title:"delivery", style:"users"});

});


// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/user/login');
});

router.get('/account', ensureUserAuthenticated, (req, res) => {
    console.log("Account Type");
    console.log(res.locals.user.type);
	res.render('user/account', { style:"users"});
});

router.post('/account', (req, res) => {
    console.log("\nButton Type");

    if(req.body.submit == "Update Profile"){
        console.log("Update Profile Clicked\n");
        req.user.update({
            last_name: req.body.last_name,
            first_name: req.body.first_name
        })
        alertMessage(res, 'success','Profile Updated', 'fas fa-sign-in-alt', true);
        res.redirect('/user/account');
    }
    else if(req.body.submit == "Change Password"){
        console.log("Change Password Clicked\n");

        let password = req.body.password;
        let c_password = req.body.c_password;
        let errors = false;
        console.log(password);
        console.log(c_password);
        
        if (password !== c_password) {
            alertMessage(res, 'danger','Passwords do not match', 'fas fa-sign-in-alt', true);
            errors = true;
        }

        if (password.length < 4) {
            alertMessage(res, 'danger','Password must be at least 4 characters', 'fas fa-sign-in-alt', true);
            errors = true;
        }
        if(errors == false){
            
            bcrypt.genSalt(10, function(err, salt) {
                if (err) return next(err);
                bcrypt.hash(password, salt, function(err, hash) {
                    if (err) return next(err);
                    
                    password = hash;
                    console.log("NEW HASH");
                    req.user.update({
                        password: password
                    })
                    .then(()=> {
                        console.log("FINISH UPDATE")
                        alertMessage(res, 'success','Password Changed', 'fas fa-sign-in-alt', true);
                        res.redirect('/user/account');
                    })
                    .catch(err => console.log(err));
                    
                });
            });
        }
        else{
            res.render('user/account', { style:"users"});
        }
    }
    else if(req.body.submit == "Update Address"){
        console.log("Update Address Clicked\n");
        req.user.update({
            postal_code: req.body.postal_code,
            country: req.body.country,
            city: req.body.city,
            unit_number: req.body.unit_number,
            address: req.body.address
        })
        alertMessage(res, 'success','Address Updated', 'fas fa-sign-in-alt', true);
        res.redirect('/user/account');
    }
    
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