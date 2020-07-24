const mySQLDB = require('./DBConfig');
//const customer = require('../models/Customer_model');
//const merchant = require('../models/Merchant_model');
const user = require('../models/User_model')
//const admin = require('../models/Admin_model');

// If drop is true, all existing tables are dropped and recreated

const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('ecommerce database connected');
        })
        .then(() => {
            /*
            Defines the relationship where a user has many videos.
            In this case the primary key from user will be a foreign key
            in video.
            */
            //user.hasMany(video);
            //merchant.hasMany(customer);
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };