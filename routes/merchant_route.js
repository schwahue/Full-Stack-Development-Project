const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger.js");
var bcrypt = require("bcryptjs");
const User = require("../models/User_model");
const Order = require("../models/Order_model");
const OrderItem = require("../models/OrderItem_model");
const Product = require("../models/productModel");
const { error } = require("console");
const ensureAuthenticated = require("../helpers/auth");
const { ensureMerchantAuthenticated } = require("../helpers/auth");
const { body, validationResult } = require("express-validator");
const QRCode = require("qrcode");
const uuid = require("uuid");

// Required for file upload
const fs = require("fs");
const upload = require("../helpers/imageUpload");
//Algolia
const algoliasearch = require("algoliasearch");

const {
  UserBindingContext,
} = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");
const client = algoliasearch("97Y32174KO", "d371533080d456f5aaedd6716056c612");
const index = client.initIndex("Products");

/* Hui Feng start */
router.get("/signup", (req, res) => {
  res.render("merchant/sign_up", {
    title: "Merchant - SignUp",
    style: "login_form",
  });
});

router.post(
  "/signup",
  [
    // username must be an email
    body("email")
      .notEmpty()
      .withMessage("Invalid Email")
      .bail()
      .normalizeEmail({ gmail_remove_dots: false })
      .bail()
      .isEmail()
      .bail()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ where: { email: req.body.email } }).then(
          (user) => {
            if (user) {
              return Promise.reject("Email already in use");
            }
            return true;
          }
        );
      }),

    // password must be at least 4 chars long
    body("password")
      .notEmpty()
      .withMessage("Invalid Password")
      .bail()
      .isLength({ min: 4 })
      .withMessage("Password must be at least 4 characters long")
      .bail(),

    body("c_password")
      .notEmpty()
      .withMessage("Invalid Password Comfirmation")
      .bail()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Password Confirmation must be the same as password"),

    body("contact_number")
      .notEmpty()
      .withMessage("Invalid Contact Number")
      .bail()
      .isLength({ min: 8, max: 8 })
      .withMessage("Phone must be at  8 characters long")
      .bail()
      .matches("(8|9)[0-9]{7}")
      .withMessage("Enter numbers only for contact")
      .bail()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({
          where: { contact_number: req.body.contact_number },
        }).then((user) => {
          if (user) {
            return Promise.reject("Contact Number already in use");
          }
          return true;
        });
      }),

    body("shop_name")
      .notEmpty()
      .withMessage("Invalid Shop Name")
      .bail()
      .matches("^[a-zA-Z0-9_ ]*$")
      .withMessage("Enter valid Shop Name")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Shop Name must be at least 8 characters long")
      .bail()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ where: { shop_name: req.body.shop_name } }).then(
          (user) => {
            if (user) {
              return Promise.reject("Shop Name already in use");
            }
            return true;
          }
        );
      }),
  ],
  (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    //console.log("=============errors==============")
    //console.log(errors);
    let { contact_number, email, password, shop_name } = req.body;

    if (!errors.isEmpty()) {
      //FOR TESTING
      //return res.status(422).json({ errors: errors.array() });

      let error_holder = errors.array();
      let errors_msg = [];

      for (i = 0; i < error_holder.length; i++) {
        errors_msg.push(error_holder[i].msg);
      }
      res.render("merchant/sign_up", {
        title: "Merchant - SignUp",
        style: "login_form",
        shop_name,
        contact_number,
        email,
        errors: errors_msg,
      });
      return;
    } else {
      // Create new user record
      let type = "merchant";
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) return next(err);

          password = hash;

          User.create({
            shop_name,
            email,
            password,
            contact_number,
            type,
          })
            .then((user) => {
              alertMessage(
                res,
                "success",
                user.email + " added. Please login",
                "fas fa-sign-in-alt",
                true
              );
              res.redirect("/user/login");
            })
            .catch((err) => console.log(err));
        });
      });
    }

    console.log("NO ERROR CREATIING");
    // FOR TESTING
    //res.json({ msg: "DONE" });
  }
);

router.get("/orders", ensureMerchantAuthenticated, (req, res) => {
  Order.findAll({
    where: {
      merchantId: req.user.id,
    },
    /*include: [{model: OrderItem, attributes: ['id', 'quantity', 'productId']}],*/
    include: [{ model: OrderItem, include: Product }],

    order: [["date", "DESC"]],
  })
    .then((orders) => {
      console.log("ORDERSSSSSSSSSSSSS");
      console.log(orders);
      //console.log(orders.Order_Items);
      res.render("merchant/orders", {
        title: "Merchant - Orders",
        style: "merchant",
        navbar: "merchant",
        orders: orders,
      });
      //return res.json({ msg: orders});
    })
    .catch((err) => console.log(err));
});

router.get("/order/:id", ensureMerchantAuthenticated, (req, res) => {
  Order.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "first_name",
          "last_name",
          "contact_number",
          "postal_code",
          "unit_number",
          "address",
        ],
      },
    ],
  })
    .then((order) => {
      // Testing
      //return res.json({ msg: order});
      const myurl = `http://localhost:5000/delivery/${req.params.id}`;

      QRCode.toDataURL(myurl, [{ width: 300 }])

        .then((url) => {
          console.log(url);
          res.render("merchant/order_detail", {
            order,
            qr_data: url,
            title: "Merchant - OrderDetail",
            style: "merchant",
            navbar: "merchant",
          });
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
/* Hui Feng end */

router.get("/account", ensureMerchantAuthenticated, (req, res) => {
  res.render("merchant/account", {
    title: "Merchant - Account",
    style: "merchant",
    navbar: "merchant",
  });
});

router.get("/addProduct", ensureMerchantAuthenticated, (req, res) => {
  res.render("merchant/addProduct", {
    title: "Merchant - AddProduct",
    style: "merchant",
    navbar: "merchant",
  });
}); //getAddProduct Interface

router.post(
  "/addProduct",
  [
    //Validations
    body("productName").notEmpty().trim().withMessage("Name is invalid!"),
    body("productDescription")
      .notEmpty()
      .trim()
      .withMessage("Description is invalid!"),
    body("productPrice")
      .notEmpty()
      .trim()
      .toFloat()
      .withMessage("Price is invalid!"),
    body("productStock")
      .notEmpty()
      .trim()
      .toInt()
      .withMessage("Stock is invalid!"),
  ],
  (req, res) => {
    //Check for Errors
    const errors = validationResult(req);
    let error_holder = errors.array();
    let errors_msg = [];
    for (i = 0; i < error_holder.length; i++) {
      errors_msg.push(error_holder[i].msg);
    }
    if (!errors.isEmpty()) {
      return res.render("merchant/addProduct", {
        title: "Merchant - AddProduct",
        style: "merchant",
        navbar: "merchant",
        errors: errors_msg,
      });
    }

    //valid inputs
    let productID = uuid.v1();
    let productName = req.body.productName;
    let productDescription = req.body.productDescription;
    let productPrice = req.body.productPrice;
    let productStock = req.body.productStock;
    let productCategory = req.body.productCategory;
    let productImageURL = req.body.productImageURL;
    let productOwnerID = req.user.id;

    const products = [
      {
        objectID: productID,
        productName: productName,
        productDescription: productDescription,
        productPrice: productPrice,
        productStock: productStock,
        productCategory: productCategory,
        productImageURL: productImageURL,
        productOwnerID: productOwnerID,
      },
    ];

    //create Product in remote Algolia index
    index
      .saveObjects(products)
      .then(({ objectIDs }) => {
        console.log(objectIDs);
      })
      .catch((err) => {
        console.log(err);
      });

    //create Product in local mySQL
    Product.create({
      productID: productID,
      productName: productName,
      productDescription: productDescription,
      productPrice: productPrice,
      productStock: productStock,
      productCategory: productCategory,
      productImageURL: productImageURL,
    }).then((product) => {
      alertMessage(
        res,
        "success",
        productName + " has been added",
        "fas fa-sign-in-alt",
        true
      );
      res.render("merchant/addProduct", {
        title: "Merchant - AddProduct",
        style: "merchant",
        navbar: "merchant",
      });
    });
  }
); //addProduct to db

router.get("/updateProduct/:id", ensureMerchantAuthenticated, (req, res) => {
  Product.findOne({
    where: {
      productID: req.params.id,
    },
  })
    .then((product) => {
      res.render("merchant/updateProduct", {
        product,
        title: "Merchant - AddProduct",
        style: "merchant",
        navbar: "merchant",
      });
      console.log(product.productCategory);
    })
    .catch((err) => {
      console.log(err);
    });
}); //getUpdate Interface

router.put(
  "/updateProduct/saveUpdate/:id",
  [
    //Validations
    body("productName").notEmpty().trim().withMessage("Name is invalid!"),
    body("productDescription")
      .notEmpty()
      .trim()
      .withMessage("Description is invalid!"),
    body("productPrice")
      .notEmpty()
      .trim()
      .toFloat()
      .withMessage("Price is invalid!"),
    body("productStock")
      .notEmpty()
      .trim()
      .toInt()
      .withMessage("Stock is invalid!"),
  ],
  (req, res) => {
    let productID = req.params.id;
    let productName = req.body.productName;
    let productDescription = req.body.productDescription;
    let productPrice = req.body.productPrice;
    let productStock = req.body.productStock;
    let productCategory = req.body.productCategory;
    let productImageURL = req.body.productImageURL;
    let productOwnerID = req.user.id;

    //Check for Errors
    const errors = validationResult(req);
    let error_holder = errors.array();
    let errors_msg = [];
    for (i = 0; i < error_holder.length; i++) {
      errors_msg.push(error_holder[i].msg);
    }
    if (!errors.isEmpty()) {
      return res.render("merchant/addProduct", {
        title: "Merchant - AddProduct",
        style: "merchant",
        navbar: "merchant",
        errors: errors_msg,
      });
    }

    //Valid Input
    const products = [
      {
        objectID: productID,
        productName: productName,
        productDescription: productDescription,
        productPrice: productPrice,
        productStock: productStock,
        productCategory: productCategory,
        productImageURL: productImageURL,
        productOwnerID: productOwnerID,
      },
    ];

    //updateObject
    index.saveObjects(products).then(({ productID }) => {
      console.log(productID);
    });

    Product.update(
      {
        productID,
        productName,
        productDescription,
        productPrice,
        productStock,
        productCategory,
        productImageURL,
        productOwnerID: productOwnerID,
      },
      {
        where: {
          productID: req.params.id,
        },
      }
    )
      .then((product) => {
        alertMessage(
          res,
          "success",
          productName + " has been updated",
          "fas fa-sign-in-alt",
          true
        );
        res.redirect("/merchant/displayProduct");
      })
      .catch((err) => {
        console.log(err);
      });
  }
); //updateExisting Products

router.get("/displayProduct", ensureMerchantAuthenticated, (req, res) => {
  Product.findAll({})
    .then((products) => {
      res.render("merchant/displayProduct", {
        products: products,
        title: "Merchant - AddProduct",
        style: "merchant",
        navbar: "merchant",
      });
    })
    .catch((err) => console.log(err));
}); //getExsiting Products

router.get("/deleteProduct/:id", ensureMerchantAuthenticated, (req, res) => {
  let productID = req.params.id;

  index.deleteObject(productID).catch((err) => {
    console.log(err);
  });

  Product.findOne({
    where: { productID: productID },
  })
    .then((product) => {
      let productName = product.productName
      if (productID == null) {
        res.redirect("/");
      } else {
        Product.destroy({
          where: {
            productID: productID,
          },
        }).then((product) => {
          alertMessage(
            res,
            "danger",
            productName + " has been deleted",
            "fas fa-sign-in-alt",
            true
          );
          res.redirect("/merchant/displayProduct");
        });
      }
    })
    .catch((err) => {
      console.log;
    });
}); //deleteExisting Products

router.post("/upload", ensureMerchantAuthenticated, (req, res) => {
  // Creates user id directory for upload if not exist
  if (!fs.existsSync("./public/uploads/testing")) {
    fs.mkdirSync("./public/uploads/testing");
  }

  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.json({ file: "/img/no-image.jpg", err: err });
    } else {
      if (req.file === undefined) {
        console.log(err);
        res.json({ file: "/img/no-image.jpg", err: err });
      } else {
        res.json({ file: `/uploads/testing/${req.file.filename}` });
        console.log("Image uploaded!");
      }
    }
  });
}); //uploadImage

module.exports = router;
