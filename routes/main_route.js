const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger.js");
const Product = require("../models/productModel.js"); //import Product
const discountCode = require("../models/discountModel.js");
const simpleOrder = require("../models/simpleOrderModel.js");
const algoliasearch = require("algoliasearch");
const paypal = require("@paypal/checkout-server-sdk");
const payPalClient = require("../config/payPalClient");
const requestify = require("requestify");
const Order = require('../models/Order_model');
const OrderItem = require('../models/OrderItem_model');
const User = require('../models/User_model');
const {send_shipping_confirmation_email} = require("../helpers/send_email");
const send_sms = require("../helpers/send_sms");
const moment = require('moment');
const { ensureUserAuthenticated } = require('../helpers/auth');

// User's cart
var shopping_cart = [];
var frequentlyBoughtTogether = {};
var discount_code = { code: null };

router.get("/", (req, res) => {
    Product.findAll({
      limit: 3,
      order: [['productRating', 'DESC']]
    })
    .then((products) => {
      Product.findAll({
        limit:6,
      }).then((productsAll) =>{
        res.render("index", {
          products: products,
          productsAll: productsAll,
          title: "Home",
        });
      });
    })
    .catch((err) => console.log(err));
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

router.get("/product", (req, res) => {
  //render product page
  Product.findAll({}).then((products) => {
    res.render("product/productDisplay", {
      products: products,
    });
  });
});

// JH: <start>
async function GetFrequent() {
  // Get shopping cart items
  let cart_items = [];
  for (let i = 0; i < shopping_cart.length; i++) {
    cart_items.push(shopping_cart[i].productID);
  }

  // Retrieve items of orders in database
  let recommendedItems = {};
  const items = await simpleOrder.findAll({
    attributes: ["items"],
  });

  // Find how frequently bought together items
  for (let i = 0; i < items.length; i++) {
    let boolSearch = false;
    var obj = JSON.parse(items[i].dataValues.items);
    let theItems = Object.keys(obj);

    // Check if this order has items that relate to user's cart
    cart_items.forEach((productID) => {
      if (theItems.includes(productID)) {
        boolSearch = true;
      }
    });
    if (boolSearch) {
      for (let i = 0; i < theItems.length; i++) {
        if (!Object.keys(recommendedItems).includes(theItems[i])) {
          recommendedItems[theItems[i]] = 1;
        } else {
          recommendedItems[theItems[i]] = parseInt(
            recommendedItems[theItems[i]] + 1
          );
        }
      }
    }
  }

  // Sort it
  var sortable = [];
  for (var i in recommendedItems) {
    sortable.push([i, recommendedItems[i]]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  //Choose top 3 that are not in cart
  const testrecommendedItems = [1, 2];
  recommendedItems = [];
  for (let i = 0; i < sortable.length; i++) {
    console.log(
      "test code " +
        cart_items +
        "|" +
        sortable[i][0] +
        "|" +
        cart_items.includes(sortable[i][0])
    );
    if (!cart_items.includes(sortable[i][0])) {
      Product.findOne({ where: { productID: sortable[i][0] } })
        .then((product) => {
          if (product) {
            recommendedItems.push({
              productName: product.productName,
              productPrice: product.productPrice.toFixed(2),
              productTotal: product.productPrice.toFixed(2),
              productID: product.productID,
              productDescription: product.productDescription,
              productCategory: product.productCategory,
              productImageURL: product.productImageURL,
            });
          }
        })
        .then(function (result) {
          frequentlyBoughtTogether = recommendedItems;
        })
        .then(() => {
          console.log("this is frequent " + frequentlyBoughtTogether);
        });
    }
  }
  frequentlyBoughtTogether = recommendedItems;
}

router.get("/cart", async (req, res) => {
  // const secondFunction = async () => {
  //     const result = await GetFrequent()
  //     let totalprice = 0.0;
  //     for (let i = 0; i < shopping_cart.length; i++) {
  //         totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
  //         // Update product total
  //         shopping_cart[i].productTotal = shopping_cart[i].productPrice * shopping_cart[i].quantity;
  //         shopping_cart[i].productTotal = parseFloat(shopping_cart[i].productTotal).toFixed(2);
  //     }
  //     info = [{ totalprice: totalprice }]
  //     res.render('payment/cart', {
  //         products: shopping_cart,
  //         info: info,
  //         recommended: frequentlyBoughtTogether
  //     });
  // }
  // secondFunction();
  GetFrequent()
    .then(function (something) {
      while (frequentlyBoughtTogether.length > 3) {
        frequentlyBoughtTogether.pop();
      }
    })
    .then(function (somethingagain) {
      console.log(discount_code);
      let totalprice = 0.0;
      for (let i = 0; i < shopping_cart.length; i++) {
        totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
        // Update product total
        if ((discount_code.code == null) == false) {
          shopping_cart[i].productTotal =
            shopping_cart[i].productPrice *
            shopping_cart[i].quantity *
            (1 - parseFloat(discount_code.amount));
        } else {
          shopping_cart[i].productTotal =
            shopping_cart[i].productPrice * shopping_cart[i].quantity;
        }
        shopping_cart[i].productTotal = parseFloat(
          shopping_cart[i].productTotal
        ).toFixed(2);
      }
      if ((discount_code.code == null) == false) {
        console.log(totalprice);
        totalprice = totalprice * (1 - discount_code.amount);
      }
      console.log(totalprice);
      info = [{ totalprice: totalprice }];
      var discountarray = [];
      discountarray.push(discount_code);
      res.render("payment/cart", {
        products: shopping_cart,
        info: info,
        recommended: frequentlyBoughtTogether,
        discount: discountarray,
      });
    });
  // let totalprice = 0.0;
  // for (let i = 0; i < shopping_cart.length; i++) {
  //     totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
  //     // Update product total
  //     shopping_cart[i].productTotal = shopping_cart[i].productPrice * shopping_cart[i].quantity;
  //     shopping_cart[i].productTotal = parseFloat(shopping_cart[i].productTotal).toFixed(2);
  // }
  // info = [{ totalprice: totalprice }]
  // res.render('payment/cart', {
  //     products: shopping_cart,
  //     info: info,
  //     recommended: frequentlyBoughtTogether
  // });
});

function delay() {
  return new Promise(resolve => setTimeout(resolve, 3000));
}

router.get("/testsearch", async (req, res) => {
  let user_id = req.user.id
  let user_orders = []
  let count = 0
  let counter = 1
  let what = await simpleOrder.findAll({ where: { userId: user_id } }).then((orders) => {
    if (orders) {
      count = orders.length
      // orders[0].dataValues.items[2] this is first item
      // orders[0].dataValues.items[5] this is quantity
      for (let i = 0; i < orders.length; i++) {
        Product.findOne({ where: { productID: orders[i].dataValues.items[2] } }).then((product) => {
          if (product) {
            console.log(orders[i].dataValues)
            user_orders.push({
              ordernumber: orders[i].dataValues.id,
              productName: product.productName,
              productImageURL: product.productImageURL,
              quantity: orders[i].dataValues.items[5],
              productTotal: orders[i].dataValues.totalPrice,
            });
          }
        });
        counter++;
      }
      
    } else {

    }
  });
  await delay()
  res.render("payment/testcart", {
    orders: user_orders
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

router.get("/cart/remove/:id", (req, res) => {
  RemoveFromCart(req.params.id);
  GetFrequent().then(() => {
    res.redirect("/cart");
  });
});

// Plus quantity
router.get("/cart/up/:id", (req, res) => {
  for (let i = 0; i < shopping_cart.length; i++) {
    if (req.params.id == shopping_cart[i].productID) {
      shopping_cart[i].quantity += 1;
    }
  }
  res.redirect("/cart");
});

// Minus quantity
router.get("/cart/down/:id", (req, res) => {
  for (let i = 0; i < shopping_cart.length; i++) {
    if (req.params.id == shopping_cart[i].productID) {
      shopping_cart[i].quantity -= 1;
      if (shopping_cart[i].quantity < 1) {
        RemoveFromCart(shopping_cart[i].productID);
      }
    }
  }
  res.redirect("/cart");
});

// Search cart
router.get("/cart/search", (req, res) => {
  for (let i = 0; i < matches.length; i++) {
    console.log(matches[i]);
  }
  let totalprice = 0.0;
  for (let i = 0; i < shopping_cart.length; i++) {
    totalprice += shopping_cart[i].productPrice * shopping_cart[i].quantity;
  }
  info = [{ totalprice: totalprice }];
  res.render("payment/cart", {
    products: matches,
    info: info,
  });
});

// Discount code
router.get("/cart/:id", (req, res) => {
  console.log(req.params.id);
  discountCode.findOne({ where: { code: req.params.id } }).then((discount) => {
    if (discount) {
      discount_code["code"] = discount.code;
      discount_code["amount"] = discount.amount;
    } else {
      discount_code = {};
    }
  });
  res.end();
});

router.get("/discount/:code/:amount", (req, res) => {
  discountCode.create({
    code: req.params.code,
    active: true,
    amount: req.params.amount
  });
  res.end();
});

router.get("/processing", (req, res) => {
  res.render("payment/processing");
});

router.get("/creditcard_s", (req, res) => {
  res.render("payment/creditcard_success");
});

router.get("/creditcard", (req, res) => {
  res.render("payment/creditcard");
});

router.get("/debug", (req, res) => {
  res.render("payment/debug_payment");
});

router.get("/debug/database", (req, res) => {
  Product.findOne({ where: { productID: "1" } }).then((product) => {
    if (product) {
      // do something
    } else {
      Product.create({
        productID: "1",
        productName: "iPhone SE 64GB RED",
        productDescription: "Another iPhone",
        productPrice: 649.0,
        productStock: 5,
        productCategory: "Phones",
        productBrand: "Apple",
        productImageURL: "/img/iphone-se-red-select-2020.jpg",
      });
    }
  });

  Product.findOne({ where: { productID: "2" } }).then((product) => {
    if (product) {
      // do something
    } else {
      Product.create({
        productID: "2",
        productName: "iPhone 11 64GB Yellow",
        productDescription: "Another iPhone",
        productPrice: 649.0,
        productStock: 5,
        productCategory: "Phones",
        productBrand: "Apple",
        productImageURL: "/img/iphone11-yellow-select-2019.jpg",
      });
    }
  });

  Product.findOne({ where: { productID: "3" } }).then((product) => {
    if (product) {
      // do something
    } else {
      Product.create({
        productID: "3",
        productName: "Apple AirPods",
        productDescription:
          "A revolutionary true wireless earbuds that will elevate your listening experience to a whole new level",
        productPrice: 249.0,
        productStock: 5,
        productCategory: "Audio",
        productBrand: "Apple",
        productImageURL: "/img/iphone-se-red-select-2020.jpg",
      });
    }
  });
  res.redirect("/debug");
});

router.get("/debug/database/truncate", (req, res) => {
  Product.destroy({
    where: {},
    truncate: true,
  });
  res.redirect("/debug");
});



router.get('/cart/add/:id', (req, res) => {
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
                        productImageURL: product.productImageURL,
                        productOwner: product.productOwnerID,
                        quantity: 1,
                    });
                    GetFrequent();
                }
                shopping_cart.forEach(element => console.log(element));
            } else {
                console.log('product does not exist');
            }
        });
    res.redirect('/product');
});

router.get('/recommended/:id', (req, res) => {
    Product.findOne({ where: { productID: req.params.id.toString() } })
        .then(product => {
            if (product) {
                shopping_cart.push({
                    productName: product.productName,
                    productPrice: product.productPrice.toFixed(2),
                    productTotal: product.productPrice.toFixed(2),
                    productID: product.productID,
                    productDescription: product.productDescription,
                    productCategory: product.productCategory,
                    productImageURL: product.productImageURL,
                    quantity: 1,
                });
            }
        }).then(function(nothing) {
            GetFrequent();
        }).then(function(nothing) {
            res.redirect('/cart');
        })
    // res.redirect('/cart');
});

router.get("/recommended/:id", (req, res) => {
  Product.findOne({ where: { productID: req.params.id.toString() } })
    .then((product) => {
      if (product) {
        shopping_cart.push({
          productName: product.productName,
          productPrice: product.productPrice.toFixed(2),
          productTotal: product.productPrice.toFixed(2),
          productID: product.productID,
          productDescription: product.productDescription,
          productCategory: product.productCategory,
          productImageURL: product.productImageURL,
          quantity: 1,
        });
      }
    })
    .then(function (nothing) {
      GetFrequent();
    })
    .then(function (nothing) {
      res.redirect("/cart");
    });
  // res.redirect('/cart');
});

router.post("/pay", async (req, res) => {
  let item_list = [];
  let totalprice = 0.0;
  for (let i = 0; i < shopping_cart.length; i++) {
    var productPrice = shopping_cart[i].productPrice;
    if ((discount_code.code == null) == false) {
      productPrice = productPrice * (1 - discount_code.amount);
    }
    item_list.push({
      name: shopping_cart[i].productName,
      description: shopping_cart[i].productDescription,
      sku: shopping_cart[i].productID,
      unit_amount: {
        currency_code: "SGD",
        value: productPrice,
      },
      quantity: shopping_cart[i].quantity,
      category: "PHYSICAL_GOODS",
    });

    totalprice += productPrice * shopping_cart[i].quantity;
  }
  // PayPal
  // 3. Call PayPal to set up a transaction
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    application_context: {
      return_url: "http://localhost:5000/123",
      cancel_url: "https://www.google.com",
      brand_name: "EXAMPLE INC",
      locale: "en-US",
      landing_page: "BILLING",
      shipping_preference: "SET_PROVIDED_ADDRESS",
      user_action: "CONTINUE",
    },
    purchase_units: [
      {
        reference_id: "PUHF",
        description: "Sporting Goods",

        custom_id: "CUST-HighFashions",
        soft_descriptor: "HighFashions",
        amount: {
          currency_code: "SGD",
          value: totalprice,
          breakdown: {
            item_total: {
              currency_code: "SGD",
              value: totalprice,
            },
          },
        },
        items: item_list,
        shipping: {
          method: "United States Postal Service",
          name: {
            full_name: "John Doe",
          },
          address: {
            address_line_1: "123 Townsend St",
            address_line_2: "Floor 6",
            admin_area_2: "San Francisco",
            admin_area_1: "CA",
            postal_code: "94107",
            country_code: "US",
          },
        },
      },
    ],
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
    orderID: order.result.id,
  });
});

router.post("/getlocation", (req, res) => {
  let custlon, custlat, deliverylon, deliverylat;
  let newlocation = {};
  let key = "340903c45281bd";
  let q = "Punggol Waterway point";
  let format = "json";
  let url =
    "https://us1.locationiq.com/v1/search.php" +
    "?key=" +
    key +
    "&q=" +
    q +
    "&format=" +
    format;

  requestify
    .get(url)
    .then(function (response) {
      let location = response.getBody();
      custlon = location[0].lon;
      custlat = location[0].lat;
    })
    .then(() => {
      q = "Jurong Bird Park";
      url =
        "https://us1.locationiq.com/v1/search.php" +
        "?key=" +
        key +
        "&q=" +
        q +
        "&format=" +
        format;
      requestify
        .get(url)
        .then(function (response) {
          let location = response.getBody();
          deliverylon = location[0].lon;
          deliverylat = location[0].lat;
        })
        .then(() => {
          res.send({
            deliverylon: deliverylon,
            deliverylat: deliverylat,
            custlon: custlon,
            custlat: custlat,
          });
        });
    });
});

router.get("/testlocation", (req, res) => {
  res.render("user/testshippinglocation");
});

router.post("/success", async (req, res) => {
  console.log("do i come here?");
  // 2a. Get the order ID from the request body
  const orderID = req.body.orderID;

  // 3. Call PayPal to capture the order
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await payPalClient.client().execute(request);

    // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
    const captureID = capture.result.purchase_units[0].payments.captures[0].id;
    // await database.saveCaptureID(captureID);
  } catch (err) {
    // 5. Handle any errors from the call
    console.error(err);
    return res.send(500);
  }

  // 6. Return a successful response to the client

  // Save payment record to database
  let itemsObject = {};
  let totalPrice = 0.0;
  for (let i = 0; i < shopping_cart.length; i++) {
    var productPrice = shopping_cart[i].productPrice;
    if ((discount_code.code == null) == false) {
      productPrice = productPrice * (1- discount_code.amount)
    }
    itemsObject[shopping_cart[i].productID] = shopping_cart[i].quantity;
    totalPrice += productPrice * shopping_cart[i].quantity;
  }
  let dateObject = new Date();
  let currentDate =
    dateObject.getFullYear() +
    "-" +
    (dateObject.getMonth() + 1) +
    "-" +
    dateObject.getDate();
  console.log("this is totalprice: " + totalPrice);

  /****************************/
  /* HF START YO*/
  /****************************/

  //user: req.user.id
  console.log(itemsObject);
  console.log("HOOOOOOOOOOO");
  console.log(shopping_cart);
  console.log(totalPrice);
  console.log(req.user.id);
  //let now = moment(new Date(date)).format('MM-DD-YYYY')
  //let today = new Date();
  var myStuff = shopping_cart;


  Order.create({
    date: moment(currentDate, "YYYY-MM-DD"),
    status: 'paid',
    userId: req.user.id,
    merchantId: myStuff[0].productOwner,
    total_cost: totalPrice

  }).then((order) => {
    User.findOne({ where: { id: req.user.id } }).then((user) =>{
      send_shipping_confirmation_email(user, order.id, order.total_cost);
      send_sms(`You Order#${order.id} has been confirmed and paid successfully`, user.contact_number);
    })
    
    console.log("HEHEHEHEHEHE");
    console.log("HEHEHEHEHEHE");
    console.log("HEHEHEHEHEHE");
    console.log("HEHEHEHEHEHE");
    console.log(myStuff.length);
    console.log(myStuff);
    for (let p = 0; p < myStuff.length; p++) {

      console.log("first item");
      console.log(myStuff[p]);

      OrderItem.create({
        quantity: myStuff[p].quantity,
        productProductID: myStuff[p].productID,
        OrderId: order.id
      }).catch((err) => console.log(err));

    }

  }).catch((err) => console.log(err)); 
  console.log("BYEEEEEEEEEEEEE");
  /****************************/
  /* HF END YO*/
  /****************************/

  simpleOrder.create({
    userId: req.user.id,
    items: JSON.stringify(itemsObject),
    date: currentDate,
    totalPrice: totalPrice,
  });
  res.redirect("debug");
  shopping_cart = [];
});

var matches;
router.get("/search", (req, res) => {
  var substringRegex;
  matches = [];
  let matches_name = [];
  substrRegex = new RegExp(req.query.key, "i");
  for (let i = 0; i < shopping_cart.length; i++) {
    if (substrRegex.test(shopping_cart[i].productName)) {
      console.log("this is asd123");
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
  info = [{ totalprice: totalprice }];
  console.log("does it come here?");
});

// JH: <end>

// Matt: about, faq, feedback

router.get("/aboutus", (req, res) => {
  res.render("feedback_and_others/aboutus");
});

router.get("/faq", (req, res) => {
  res.render("feedback_and_others/faq");
});

router.get("/feedback", (req, res) => {
  res.render("feedback_and_others/feedback");
});

// Matt: form
router.get("/feedback2", (req, res) => {
  res.render("feedback_and_others/feedback2.handlebars");
});

// Matt: livechat
router.get("/livechat", (req, res) => {
  res.render("chat/chat.ejs");
});

// Matt: chatbot
router.get("/chatbot", (req, res) => {
  res.render("chat/chatbot.handlebars");
});


module.exports = router;
