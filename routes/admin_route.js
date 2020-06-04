const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');


const User = require('../models/User_model');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/account', (req, res) => {

    res.render('admin/account', {title:"admin", navbar:"admin"}); 

});

router.get('/users', (req, res) => {

    User.findAll()
    .then((user_list) => {
        // pass object to listVideos.handlebar
        res.render('admin/users_list', {title:"admin - Users List", navbar:"admin", style:"admin", user_list});

    })
    .catch(err => console.log(err));
     

});

module.exports = router;