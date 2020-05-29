const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Merchant = db.define('merchant', {
    shop_name: {
        type: Sequelize.STRING
    },
    
});

module.exports = Merchant;