const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const send_sms = require('../helpers/send_sms');

const User = require('../models/User_model');
const Order = require('../models/Order_model');

const Sequelize = require('sequelize');
const { ensureAuthenticated } = require('../helpers/auth');
const Op = Sequelize.Op;

router.get('/:id', ensureAuthenticated, (req, res) => {

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
            if (order) {


                if (order.userId == req.user.id || req.user.type == "admin") {
                    res.render('delivery/overview', { title: "Delivery", navbar: "none", style: "delivery", order, type: req.user.type });
                }
                else {
                    alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
                    return res.redirect('/user/logout')
                }
                //return res.json({msg: order});
            }
            else{
                alertMessage(res, 'danger', 'No Order Found', 'fas fa-exclamation-circle', true);
                    return res.redirect('/user/logout')
            }


        })
        .catch((err) => { console.log(err); });



});

router.post('/:id', ensureAuthenticated, (req, res) => {

    console.log(req.body);
    id = req.body.orderid;
    status = req.body.submit;
    if (status = "Confirm Delivery") {
        status = "Delivered";
    }

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