const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const send_sms = require('../helpers/send_sms');

const ensureAuthenticated = require('../helpers/auth');

const User = require('../models/User_model');
const Sequelize = require('sequelize');
const { ensureAdminAuthenticated } = require('../helpers/auth');
const Op = Sequelize.Op;

router.get('/account', ensureAdminAuthenticated, (req, res) => {
    //send_sms( 'LOGIN ADMIN ACCOUNT HF', req.user.contact_number);

    res.render('admin/account', {title:"admin", navbar:"admin", style:"admin"}); 

});

router.get('/users', ensureAdminAuthenticated, (req, res) => {

    User.findAll()
    .then((user_list) => {
        // pass object to listVideos.handlebar
        res.render('admin/users_list', {title:"admin - Users List", navbar:"admin", style:"admin", user_list});

    })
    .catch(err => console.log(err));

});

module.exports = router;