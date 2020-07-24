const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const orders = db.define('orders', {
    userId: {
        type: Sequelize.INTEGER
    },
    items: {
        type: Sequelize.STRING
    },
    date: {
        type: Sequelize.DATEONLY
    },
    totalPrice: {
        type: Sequelize.FLOAT
    }
});

module.exports = orders;