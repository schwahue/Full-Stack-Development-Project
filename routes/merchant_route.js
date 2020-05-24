const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/signup', (req, res) => {

    res.render('merchant/sign_up', {title:"Merchant-SignUp", style:"signup_form"});

});

module.exports = router;