const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const Product = require('../models/productModel.js'); //import Product 
const algoliasearch = require('algoliasearch')
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('../config/payPalClient');

// User's cart
var shopping_cart = [];

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' }); // renders views/index.handlebars
});

// router.get('/about', (req, res) => {

// 	const author = 'DEV NAME??';
// 	alertMessage(res, 'success', 'This is an important message', 'fas fa-sign-in-alt', true);
// 	alertMessage(res, 'danger', 'Unauthorised access', 'fas fa-exclamation-circle', false);
// 	//alertMessage(res, 'error', 'Unauthorised access', 'fas fa-exclamation-circle', false);
// 	console.log("about page");

// 	let success_msg = 'Success message';
// 	let error_msg = 'Error message using error_msg';
// 	//let errors = ["test", "No", "die", 3];


// 	//res.render('about', {author: author, success_msg: success_msg, error_msg: error_msg, errors: errors});
// 	res.render('about', {author: author});
// });


router.get('/product', (req, res) => { //render product page
    Product.findAll({
    }).then((products) => {
        res.render('product/productDisplay', {
            products: products,
        })
    })
})

// JH: <start>
router.get('/cart', (req, res) => {
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
    info = [{ totalprice: totalprice }]
    res.render('payment/cart', {
        products: shopping_cart,
        info: info
    });
});

// Remove item
function RemoveFromCart(id) {
    for (let i = 0; i < shopping_cart.length; i++) {
        if (id == shopping_cart[i].productID) {
            shopping_cart.splice(i, 1);
            break;
        }
    }
}

router.get('/cart/remove/:id', (req, res) => {
    RemoveFromCart(req.params.id);
    res.redirect('/cart');
});

// Plus quantity
router.get('/cart/up/:id', (req, res) => {
    for (let i = 0; i < shopping_cart.length; i++) {
        if (req.params.id == shopping_cart[i].productID) {
            shopping_cart[i].quantity += 1
        }
    }
    res.redirect('/cart');
});

// Minus quantity
router.get('/cart/down/:id', (req, res) => {
    for (let i = 0; i < shopping_cart.length; i++) {
        if (req.params.id == shopping_cart[i].productID) {
            shopping_cart[i].quantity -= 1
            if (shopping_cart[i].quantity < 1) {
                RemoveFromCart(shopping_cart[i].productID);
            }
        }
    }
    res.redirect('/cart');
});

// Search cart
router.get('/cart/search', (req, res) => {
    for (let i = 0; i < matches.length; i++) {
        console.log(matches[i]);
    }
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
    info = [{ totalprice: totalprice }]
    res.render('payment/cart', {
        products: matches,
        info: info
    });
});

router.get('/processing', (req, res) => {
    res.render('payment/processing');
});

router.get('/creditcard_s', (req, res) => {
    res.render('payment/creditcard_success');
});

router.get('/creditcard', (req, res) => {
    res.render('payment/creditcard');
});

router.get('/debug', (req, res) => {
    res.render('payment/debug_payment');
});

router.get('/debug/database', (req, res) => {
    Product.findOne({ where: { productID: '1' } })
        .then(product => {
            if (product) {
                // do something
            } else {
                Product.create({
                    productID: '1',
                    productName: 'iPhone SE 64GB RED',
                    productDescription: 'Another iPhone',
                    productPrice: 649.00,
                    productStock: 5,
                    productCategory: 'Phones',
                    productBrand: 'Apple'
                })
            }
        });

    Product.findOne({ where: { productID: '2' } })
        .then(product => {
            if (product) {
                // do something
            } else {
                Product.create({
                    productID: '2',
                    productName: 'iPhone 11 64GB Rose Gold',
                    productDescription: 'Another iPhone',
                    productPrice: 649.00,
                    productStock: 5,
                    productCategory: 'Phones',
                    productBrand: 'Apple'
                })
            }
        });
    res.redirect('/debug');
});

router.get('/debug/database/truncate', (req, res) => {
    Product.destroy({
        where: {},
        truncate: true
    })
    res.redirect('/debug');
});

router.get('/debug/add/:id', (req, res) => {
    console.log(req.params.id);
    Product.findOne({ where: { productID: req.params.id.toString() } })
        .then(product => {
            if (product) {
                let exist = false;
                for (let i = 0; i < shopping_cart.length; i++) {
                    if (shopping_cart[i].productName == product.productName) {
                        exist = true;
                        shopping_cart[i].quantity += 1;
                        shopping_cart[i].productTotal = shopping_cart[i].productPrice * shopping_cart[i].quantity;
                    }
                }
                if (!exist) {
                    shopping_cart.push({
                        productName: product.productName,
                        productPrice: product.productPrice.toFixed(2),
                        productTotal: product.productPrice.toFixed(2),
                        productID: product.productID,
                        productDescription: product.productDescription,
                        productCategory: product.productCategory,
                        quantity: 1,
                    });
                }
                shopping_cart.forEach(element => console.log(element));
            } else {
                console.log('product does not exist');
            }
        });
    res.redirect('/debug');
});

router.post('/pay', async (req, res) => {
    let item_list = [];
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        item_list.push({
            name: shopping_cart[i].productName,
            description: shopping_cart[i].productDescription,
            sku: shopping_cart[i].productID,
            unit_amount : {
                currency_code : "SGD",
                value: shopping_cart[i].productPrice,
            },
            quantity: shopping_cart[i].quantity,
            category: 'PHYSICAL_GOODS'
        });

        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
    // PayPal
    // 3. Call PayPal to set up a transaction
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        "intent": "CAPTURE",
        "application_context": {
            "return_url": "http://localhost:5000/123",
            "cancel_url": "https://www.google.com",
            "brand_name": "EXAMPLE INC",
            "locale": "en-US",
            "landing_page": "BILLING",
            "shipping_preference": "SET_PROVIDED_ADDRESS",
            "user_action": "CONTINUE"
        },
        "purchase_units": [
            {
                "reference_id": "PUHF",
                "description": "Sporting Goods",

                "custom_id": "CUST-HighFashions",
                "soft_descriptor": "HighFashions",
                "amount": {
                    "currency_code": "SGD",
                    "value": totalprice,
                    "breakdown": {
                        "item_total": {
                            "currency_code": "SGD",
                            "value": totalprice
                        }
                    }
                },
                "items": item_list,
                "shipping": {
                    "method": "United States Postal Service",
                    "name": {
                        "full_name": "John Doe"
                    },
                    "address": {
                        "address_line_1": "123 Townsend St",
                        "address_line_2": "Floor 6",
                        "admin_area_2": "San Francisco",
                        "admin_area_1": "CA",
                        "postal_code": "94107",
                        "country_code": "US"
                    }
                }
            }
        ]
    });

    let order;
    try {
        order = await payPalClient.client().execute(request);
    } catch (err) {

        // 4. Handle any errors from the call
        console.error(err);
        return res.send(500);
    }

    // 5. Return a successful response to the client with the order ID
    res.status(200).json({
        orderID: order.result.id
    });
});

router.post('/success', async (req, res) => {
    console.log('do i come here?');
    // 2a. Get the order ID from the request body
    const orderID = req.body.orderID;

    // 3. Call PayPal to capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await payPalClient.client().execute(request);

        // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
        const captureID = capture.result.purchase_units[0]
            .payments.captures[0].id;
        // await database.saveCaptureID(captureID);

    } catch (err) {

        // 5. Handle any errors from the call
        console.error(err);
        return res.send(500);
    }

    // 6. Return a successful response to the client
    res.redirect('debug');
    console.log('SUCCESSjlksdsgpikesgoip!');
    shopping_cart = [];
});
var matches;
router.get('/search', (req, res) => {
    var substringRegex;
    matches = [];
    let matches_name = []
    substrRegex = new RegExp(req.query.key, 'i');
    for (let i = 0; i < shopping_cart.length; i++) {
        if (substrRegex.test(shopping_cart[i].productName)) {
            console.log('this is asd123');
            console.log(shopping_cart[i]);
            matches.push(shopping_cart[i]);
        }
    }
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
    for (let i = 0; i < matches.length; i++) {
        matches_name.push(matches[i].productName);
    }
    res.end(JSON.stringify(matches_name));
    info = [{ totalprice: totalprice }]
    console.log('does it come here?');
});

// JH: <end>

// Matt

router.get('/aboutus', (req, res) => {
    res.render('feedback_and_others/aboutus');
});

router.get('/faq', (req, res) => {
    res.render('feedback_and_others/faq');
});

router.get('/feedback', (req, res) => {
    res.render('feedback_and_others/feedback');
})


module.exports = router;