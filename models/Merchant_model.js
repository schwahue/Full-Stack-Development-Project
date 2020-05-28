const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Merchant = db.define('merchant', {
    shop_name: {
        type: Sequelize.STRING
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    contact_number: {
        type: Sequelize.STRING
    },
    
});

module.exports = Merchant;