const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/signup', (req, res) => {

    res.render('merchant/sign_up', {title:"Merchant - SignUp", style:"signup_form"});

});

router.get('/account', (req, res) => {

    res.render('merchant/account', {title:"Merchant - Account", style:"merchant"});

});

module.exports = router;