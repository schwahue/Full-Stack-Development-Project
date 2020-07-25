const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

/* Get from Product
1. name
2. pic
3. desccription
*/
const OrderItem = db.define('Order_Item', {
    quantity: {
        type: Sequelize.INTEGER
    }
    
});

module.exports = OrderItem;