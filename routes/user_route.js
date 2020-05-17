const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/login', (req, res) => {

    res.render('user/login', {title:"login", style:"login_form"}); 

});

router.post('/login', (req, res) => {

    res.render('user/login'); 

});

router.get('/signup', (req, res) => {

    res.render('user/sign_up',  {title:"Sign Up", style:"login_form"}); 

});

router.post('/signup', (req, res) => {

    res.render('user/sign_up'); 

});


// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Logout User
router.get('/id', (req, res) => {

	res.render('user/account');
});




module.exports = router;