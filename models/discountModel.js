const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const discountCode = db.define('discountCode', {
    code: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    amount: {
        type: Sequelize.FLOAT
    }

});

module.exports = discountCode;