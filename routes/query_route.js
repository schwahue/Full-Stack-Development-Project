const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const send_sms = require('../helpers/send_sms');

const User = require('../models/User_model');
const Order = require('../models/Order_model');
const Tracking = require('../models/TrackingModel');

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

router.get('/check_shopname_availability', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);

    User.findOne({ 
        where: { shop_name: req.query.shop_name } 
    }).then((user) => {
        if(user){
            res.send(false);

        }   
        else{

            res.send(true);
        }

    }).catch(err => console.log(err));

});

router.get('/check_shopname_availability', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);

    User.findOne({ 
        where: { shop_name: req.query.shop_name } 
    }).then((user) => {
        if(user){
            res.send(false);

        }   
        else{

            res.send(true);
        }

    }).catch(err => console.log(err));

});

router.get('/get_long_lat', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);

    Tracking.findOne({ 
        where: { orderid: req.query.orderid } 
    }).then((tracking) => {
        if(tracking){
            res.send(tracking);

        }  

    }).catch(err => console.log(err));

});

router.get('/set_long_lat', (req, res) => {

    console.log("HOHOHOHO")
    console.log(req.body);
    console.log(req.query);
    
    Tracking.findOne({ 
        where: { orderid: req.query.orderid } 
    }).then((tracking) => {
        if(tracking){

            tracking.update({
                longitude: req.query.longitude,
                latitude: req.query.latitude 
            }).then(()=>{
                console.log("UPDATED TRACKING")
            });
        }   
        else {
            Tracking.create({ 
                orderid: req.query.orderid, 
                longitude: req.query.longitude, 
                latitude: req.query.latitude 
            }).then(() => {
                console.log("new tracking created")
            })
        }

    }).catch(err => console.log(err));

});

router.get('/get_user_list', (req, res) => {
    console.log(req.query)
    
    User.findAll({ 
        where: { type: req.query.type } 
    })
    .then((user_list) => {
        res.send(user_list);
    })
    .catch(err => console.log(err));

});


module.exports = router;