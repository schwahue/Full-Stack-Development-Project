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
    res.render('delivery/overview', { title: "Delivery", navbar: "none", style: "delivery" });



});

router.get('/:id', (req, res) => {
    Order.findOne({
        where: {
            id: req.params.id,
        },
        include: [{
            model: User, as: "user",
            attributes: ['first_name', 'last_name', 'contact_number', 'postal_code', 'unit_number', 'address']
        }]

    })
        .then((order) => {
            //return res.json({msg: order});
            res.render('delivery/overview', { title: "Delivery", navbar: "none", style: "delivery", order });


        })
        .catch((err) => { console.log(err); });


});

router.post('/:id', (req, res) => {

    console.log(req.body);
    id = req.body.orderid;
    status = req.body.submit;
    
    Order.update(
        {
            status
        },
        {
            where: {
                id: id,
            },
        }
    )
        .then((order) => {
            const myurl = `/delivery/${id}`
            res.redirect(myurl);
        })
        .catch((err) => {
            console.log(err);
        });

});



module.exports = router;