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

router.get('/overview', (req, res) => {
    res.render('mastercontrol', { title: "master", style: "users" });



});




module.exports = router;