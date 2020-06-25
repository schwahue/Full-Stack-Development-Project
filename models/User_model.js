const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const User = db.define('user', {
    email: {
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
    },
    googleId:{
        type: Sequelize.STRING
    },
    facebookId:{
        type: Sequelize.STRING
    },
    twitterId:{
        type: Sequelize.STRING
    },
    postal_code:{
        type: Sequelize.STRING
    },
    unit_number:{
        type: Sequelize.STRING
    },
    country:{
        type: Sequelize.STRING
    },
    city:{
        type: Sequelize.STRING
    },
    address:{
        type: Sequelize.STRING
    }


    
});

module.exports = User;