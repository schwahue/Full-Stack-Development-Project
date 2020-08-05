const mySQLDB = require('./DBConfig');
const user = require('../models/User_model');
const order = require('../models/Order_model');
const order_item = require('../models/OrderItem_model');
const product = require('../models/productModel');
const discountCode = require('../models/discountModel')

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
            user.hasMany(product);
            user.hasMany(order);
            order.hasMany(order_item);
            order.belongsTo(user, { as: 'merchant'});
            order.belongsTo(user, { as: 'user'});
            //order_item.belongsTo(product, { through: 'order_details', sourceKey: 'OrderId' });
            order_item.belongsTo(product);
            
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };