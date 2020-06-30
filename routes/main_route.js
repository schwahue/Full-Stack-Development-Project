const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const Product = require('../models/productModel.js'); //import Product 
const algoliasearch = require('algoliasearch')
const paypal = require('paypal-rest-sdk');

var shopping_cart = [];

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfCx1zfNeE0VcM-q_2K1_qW0iKnU2OQHiL5s7Kh88SoI2lChcHNxhvKOFc9NWWArfobSAwlUEeleuydF',
    'client_secret': 'EIo1RA0kzzhe8Y8SX1rgB6JzgusfQ92GlXB5q-Vm4JEW1C1SUA74T03AIxOdPK3kK8F5PD-NMO2wWmfn'
});

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

router.get('/processing', (req, res) => {
    res.render('payment/processing');
});

router.get('/creditcard_s', (req, res) => {
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		'payer_id': payerId,
		'transactions': [{
			'amount': {
				'currency': 'USD',
				'total': totalprice
			}
		}]
	};

	paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
		if (error) {
			console.log(error.response);
			throw error;
		} else {
			console.log(JSON.stringify(payment));
			res.render('payment/creditcard_success');
		}
	});
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
                    productName: 'iPhone SE 64GB (PRODUCT)RED',
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

router.post('/pay', (req, res) => {
    let item_list = [];
    for (let i = 0; i < shopping_cart.length; i++) {
        item_list.push({
            name: shopping_cart[i].productName,
            sku: shopping_cart[i].productID,
            price: shopping_cart[i].productPrice,
            currency: 'USD',
            quantity: shopping_cart[i].quantity,
        });
    }
    let totalprice = 0.0;
    for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
    }
	const create_payment_json = {
		"intent": "sale",
		"payer": {
			"payment_method": "paypal"
		},
		"redirect_urls": {
			"return_url": "http://localhost:5000/creditcard_s",
			"cancel_url": "http://localhost:5000/cancel"
		},
		"transactions": [{
			"item_list": {
				"items": item_list
			},
			"amount": {
				"currency": "USD",
				"total": totalprice
			},
			"description": "This is a hat."
		}]
	};

	paypal.payment.create(create_payment_json, function (error, payment) {
		if (error) {
			throw error;
		} else {
			for (let i = 0; i < payment.links.length; i++) {
				if (payment.links[i].rel === 'approval_url') {
					res.redirect(payment.links[i].href)
				}
			}
		}
	});
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