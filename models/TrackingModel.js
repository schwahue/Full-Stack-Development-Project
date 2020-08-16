const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Tracking = db.define('tracking', {
    orderid: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    longitude: {
        type: Sequelize.STRING
    },
    latitude: {
        type: Sequelize.STRING
    }
});

module.exports = Tracking;