const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/', (req, res) => {
	res.render('index', {title: 'Home'}); // renders views/index.handlebars
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


// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/product', (req,res)=>{ //render product page
	let products = [{'name':'tristan'},{'name':'is'},{'name':'gay'}]
	res.render(
		'product/product',{
			products : products
		}
	);
})

// JH: Test codes
router.get('/cart', (req, res) => {
	res.render('payment/cart');
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
