const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const send_sms = require('../helpers/send_sms');

const User = require('../models/User_model');
const Order = require('../models/Order_model');

const ensureAuthenticated = require('../helpers/auth');

const Sequelize = require('sequelize');
const { ensureAdminAuthenticated } = require('../helpers/auth');
const Op = Sequelize.Op;

router.get('/check_email_availability', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);

    User.findOne({ 
        where: { email: req.query.email } 
    }).then((user) => {
        if(user){
            res.send(false);

        }   
        else{

            res.send(true);
        }

    }).catch(err => console.log(err));

});

router.get('/check_contact_availability', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);

    User.findOne({ 
        where: { contact_number: req.query.contact_number } 
    }).then((user) => {
        if(user){
            res.send(false);

        }   
        else{

            res.send(true);
        }

    }).catch(err => console.log(err));

});


module.exports = router;