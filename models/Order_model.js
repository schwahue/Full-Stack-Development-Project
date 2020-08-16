const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Order = db.define('Order', {
    date: {
        type: Sequelize.DATEONLY
    },
    status: {
        type: Sequelize.STRING
    },
    total_cost: {
        type:Sequelize.FLOAT
    },

});

module.exports = Order;