const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Product = db.define('product', {
    productID: {
        type: Sequelize.STRING
    },
    productName: {
        type: Sequelize.STRING
    },
    productDescription: {
        type: Sequelize.STRING
    },
    productPrice: {
        type: Sequelize.FLOAT
    },
    productStock: {
        type: Sequelize.INTEGER
    },
    productCategory: {
        type: Sequelize.STRING
    },
    productBrand: {
        type: Sequelize.STRING
    },
    productImage: {
        type: Sequelize.STRING
    }
});

module.exports = Product;