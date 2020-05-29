const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const User = db.define('user', {
    email: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    contact_number: {
        type: Sequelize.STRING
    },
    type:{
        type: Sequelize.STRING
    }

    
});

module.exports = User;