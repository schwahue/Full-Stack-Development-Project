
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Customer = db.define('customer', {
    postal_code: {
        type: Sequelize.STRING
    },
    street_name: {
        type: Sequelize.STRING
    },
    unit_number: {
        type: Sequelize.STRING
    },
    // add city?
});

module.exports = Customer;