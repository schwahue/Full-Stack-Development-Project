const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const User = require('../models/User_model');
var bcrypt = require('bcryptjs');
//const send_single_email = require('../helpers/send_email');

router.get('/signup', (req, res) => {

    res.render('merchant/sign_up', {title:"Merchant - SignUp", style:"signup_form"});

});

router.get('/account', (req, res) => {

    res.render('merchant/account', {title:"Merchant - Account", style:"merchant"});

});


router.get('/test1', (req, res) => {

    User.findOne({ where: { email: 'test' } })
    .then(user => {
        if (user) {
            // If user is found, that means email has already been
            // registered
            res.render('test/testff'); 

        }
        else{
            res.render('test/testss'); 
        }
    });

});

var authy = require('authy')('UiAk5VYGnQ7fPb9oN2muBicAl2PjWM4J');

router.get('/test2', (req, res) => {
    console.log("TEST");
    authy.request_sms(263840502, force=true, function (err, res) {
      });
    console.log("SUCCESSFUL");
});

router.get('/emailtest', (req, res) => {
    console.log("email test CALLED");
    console.log("=============");
    send_single_email();
    res.render('test/testss');
});
/*
router.get('/testsignup', (req, res) => {
    console.log("email test CALLED");
    console.log("=============");
    send_single_email();
    res.render('user/signup2', {style: "login_form"});
});
*/

router.get('/pwa', (req, res) => {
    console.log("PWA test CALLED");
    console.log("=============");
    res.render('test/testss');
});

/*
const fb = require('../helpers/firebase');

router.get('/firebase', (req, res) => {
    console.log("FIREBASE test CALLED");
    console.log("=============");
    fb();
    res.render('test/testss');
});

router.get('/upload', (req, res) => {
    console.log("FIREBASE upload CALLED");
    console.log("=============");
    res.render('test/testupload');
});
*/
module.exports = router;