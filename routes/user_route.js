const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
var bcrypt = require('bcryptjs');

const User = require('../models/User_model');
const Order = require('../models/Order_model');
const OrderItem = require('../models/OrderItem_model');
const simpleOrder = require("../models/simpleOrderModel.js");
const Product = require('../models/productModel');
const passport = require('passport');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ensureAuthenticated = require('../helpers/auth');
const { body, validationResult } = require('express-validator');

// SendGrid
const sgMail = require('@sendgrid/mail');
// JWT
const jwt = require('jsonwebtoken');


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

router.get('/signup', (req, res) => {

    res.render('user/sign_up',  {title:"Sign Up", style:"login_form"}); 

});

router.post('/signup', [

    // password must be at least 4 chars long
    body('first_name')
    .notEmpty().withMessage('Invalid First Name').bail()
    .isLength({ min: 2 }).withMessage('First Name must be at least 2 characters long').bail()
    .matches('^[a-zA-Z0-9]*$').withMessage('Enter valid First Name').bail(),

    // password must be at least 4 chars long
    body('last_name')
    .notEmpty().withMessage('Invalid Last Name').bail()
    .isLength({ min: 2 }).withMessage('Last Name must be at least 2 characters long').bail()
    .matches('^[a-zA-Z0-9]*$').withMessage('Enter valid Last Name').bail(),


    // username must be an email
    body('email')
    .notEmpty().withMessage('Invalid Email').bail()
    .normalizeEmail({gmail_remove_dots: false}).bail()
    .isEmail().bail()
    .trim()
    .custom((value, {req}) => {
        return User.findOne({ where: { email: req.body.email } }).then(user => {
            if (user) {
                return Promise.reject('Email already in use');
            }
            return true;
        });
    }),

    // password must be at least 4 chars long
    body('password')
    .notEmpty().withMessage('Invalid Password').bail()
    .isLength({ min: 4 }).withMessage('Passwordmust be at least 4 characters long').bail(),

    body('c_password')
    .notEmpty().withMessage('Invalid Password Comfirmation').bail()
    .custom((value, { req }) => value === req.body.password).withMessage('Password Confirmation must be the same as password').bail(),

    body('contact_number')
    .notEmpty().withMessage('Invalid Contact Number').bail()
    .matches('(8|9)[0-9]{7}').withMessage('Enter valid Contact Number').bail()
    .isLength({ min: 8, max: 8 }).withMessage('Contact Number must be 8 characters long').bail()
    .trim()
    .custom((value, {req}) => {
        return User.findOne({ where: { contact_number: req.body.contact_number } }).then(user => {
            if (user) {
                return Promise.reject('Contact Number already in use');
            }
            return true;
        });
    }),


    ], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    //console.log("=============errors==============")
    //console.log(errors);
    let { contact_number, email, password, first_name, last_name } = req.body;

    if (!errors.isEmpty()) {
        //FOR TESTING
        //return res.status(422).json({ errors: errors.array() });

        let error_holder = errors.array();
        let errors_msg = [];

        for(i = 0; i < error_holder.length; i++){
            errors_msg.push(error_holder[i].msg);
        }
        res.render("user/sign_up", {
            title: "Sign Up",
            style: "login_form",
            first_name,
            last_name,
            contact_number,
            email,
            errors: errors_msg,
        });
        return;
    }
    else{
        // Create new user record
    
        let type = "customer";
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) return next(err);

                password = hash;

                User.create({
                    first_name,
                    last_name,
                    email,
                    password,
                    contact_number,
                    type,
                })
                    .then((user) => {
                        alertMessage(
                            res,
                            "success",
                            user.email + " added. Please login",
                            "fas fa-sign-in-alt",
                            true
                        );
                        res.redirect("/user/login");
                    })
                    .catch((err) => console.log(err));
            });
        });
    }
    
    console.log("NO ERROR CREATIING") 
    // FOR TESTING
    //res.json({ msg: "DONE" });
});

router.get('/uorders', async (req, res)=> {
    let user_id = req.user.id
    let user_orders = []
    let count = 0
    let counter = 1
    let what = await simpleOrder.findAll({ where: { userId: user_id } }).then((orders) => {
        if (orders) {
            count = orders.length
            // orders[0].dataValues.items[2] this is first item
            // orders[0].dataValues.items[5] this is quantity
            for (let i = 0; i < orders.length; i++) {
                Product.findOne({ where: { productID: orders[i].dataValues.items[2] } }).then((product) => {
                    if (product) {
                        user_orders.push({
                            ordernumber: orders[i].dataValues.id,
                            productName: product.productName,
                            productImageURL: product.productImageURL,
                            quantity: orders[i].dataValues.items[5],
                            productTotal: orders[i].dataValues.totalPrice
                        });
                    }
                });
                counter++;
            }

        } else {

        }
    });
    await delay()
    res.render('user/uorders', {title:"deliverys", style:"users", orders: user_orders, });
});

router.get('/orders', async (req, res)=> {

    Order.findAll({
        where: {
            userId: req.user.id
        },
        attributes: ['id', 'date', 'status', 'userId'],
        /*include: [{model: OrderItem, attributes: ['id', 'quantity', 'productId']}],*/
        include: [{model: OrderItem, include: Product}]

        /*
        order: [
            ['userId']
        ]*/
    })
    .then((orders) => {
        // my code -jh
        
        //console.log(orders.Order_Items);
        res.render('user/orders', {title:"deliverys", style:"users", orders: orders, });
        //return res.json({ msg: orders});

    }).catch(err => console.log(err));
});

// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/user/login');
});

function delay() {
    return new Promise(resolve => setTimeout(resolve, 3000));
}

router.get('/account', ensureUserAuthenticated, async (req, res) => {
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
        else{
            res.redirect('/user/login');
        }
    }
    else{
        res.redirect('/user/login');
    }

});


//HF Test code End



module.exports = router;