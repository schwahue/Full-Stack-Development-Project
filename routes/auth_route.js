const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const passport = require('passport');

// listening
router.post('/', (req, res) => {
    /*
    const twiml = new MessagingResponse();

    twiml.message('The Robots are coming! Head for the hills!');

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());*/    
    console.log("Hello")
});

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', 
    { failureRedirect: '/user/login' }),
    function(req, res) {
    // Successful authentication, redirect home.
        res.redirect('/user/redirect');
    });

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter', 
    { failureRedirect: '/user/login' }),
    function(req, res) {
    // Successful authentication, redirect home.
        res.redirect('/user/redirect');
    });

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', 
    { failureRedirect: '/user/login' }),
    function(req, res) {
    // Successful authentication, redirect home.
        res.redirect('/user/redirect');
    });


module.exports = router;