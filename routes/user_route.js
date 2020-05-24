const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

//HF Test Code
router.get('/login', (req, res) => {

    res.render('user/login', {title:"login", style:"login_form"}); 
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;
    if (username == "admin" && password =="123456"){
        res.redirect('/admin');
    }
    else if(username="test" && password == "test"){
        res.redirect('/user/id');
    }
    else{
        alertMessage(res, 'danger', 'Invalid Username or Password', 'fas fa-exclamation-circle', false);

        res.render('user/login',{title:"login", style:"login_form"}); 
    }

    
});

router.get('/signup', (req, res) => {

    res.render('user/sign_up',  {title:"Sign Up", style:"signup_form"}); 

});

router.post('/signup', (req, res) => {

    res.render('user/sign_up'), {title:"Sign Up", style:"signup_form"}; 

});


router.get('/delivery', (req, res)=> {

    res.render('user/delivery', {title:"delivery", style:"users"}); 
});


// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/id', (req, res) => {

	res.render('user/account', {style:"users"});
});
//HF Test code End



module.exports = router;