const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/login', (req, res) => {

    res.render('user/login', {title:"login", style:"login_form"}); 

});

router.get('/signup', (req, res) => {

    res.render('user/sign_up'); 

});



module.exports = router;