
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Customer = db.define('customer', {
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
    postal_code: {
        type: Sequelize.STRING
    },
    street_name: {
        type: Sequelize.STRING
    },
    country: {
        type: Sequelize.STRING
    },
    contact_number: {
        type: Sequelize.STRING
    },
    unit_number: {
        type: Sequelize.STRING
    },
    // add city?
});

module.exports = Customer;