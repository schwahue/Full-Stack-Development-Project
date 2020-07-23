const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger.js");
var bcrypt = require("bcryptjs");
const User = require("../models/User_model");
const Product = require("../models/productModel.js");
const ensureAuthenticated = require("../helpers/auth");
const { ensureMerchantAuthenticated } = require("../helpers/auth");

// Required for file upload
const fs = require("fs");
const upload = require("../helpers/imageUpload");

const { body, validationResult } = require("express-validator");

//Algolia
const algoliasearch = require("algoliasearch");
const { error } = require("console");
const client = algoliasearch("97Y32174KO", "d371533080d456f5aaedd6716056c612");
const index = client.initIndex("Products");

/*
router.get('/signup', (req, res) => {

res.render('merchant/sign_up', {title:"Merchant - SignUp", style:"signup_form"});

});*/

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
      .withMessage("must be at least 4 characters long")
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
      .withMessage("must be at least 8 characters long")
      .bail()
      .matches("(8|9)[0-9]{7}")
      .withMessage("Enter numbers only")
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
      .withMessage("must be at least 8 characters long")
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

router.get("/orders", (req, res) => {
    purchases_set1 = [];
    purchases1 = {name: "Phone", quantity: "2"};
    purchases2 = {name: "Notebook", quantity: "4"};

    purchases_set1.push(purchases1);
    purchases_set1.push(purchases2);

    purchases_set2 = [];
    purchases1 = {name: "pen", quantity: "2"};
    purchases2 = {name: "pencil", quantity: "4"};

    purchases_set2.push(purchases1);
    purchases_set2.push(purchases2);

    orders = [];
    order1 = {id:"123", date:"23/12/2000", purchases: purchases_set1};
    order2 = {id:"333", date:"11/11/2001", purchases: purchases_set2};
    orders.push(order1);
    orders.push(order2);

    res.render("merchant/orders", {
        title: "Merchant - Orders",
        style: "merchant",
        navbar: "merchant",
        orders: orders
    });
});

router.get("/order_confirmation", (req, res) => {

});

router.get("/order_delete", (req, res) => {

});

router.get("/account", ensureMerchantAuthenticated, (req, res) => {
  res.render("merchant/account", {
    title: "Merchant - Account",
    style: "merchant",
    navbar: "merchant",
  });
});

router.get("/addProduct", (req, res) => {
  res.render("merchant/addProduct", {
    title: "Merchant - AddProduct",
    style: "merchant",
    navbar: "merchant",
  });
}); //getAddProduct Interface

router.post("/addProduct", (req, res) => {
  let productID = req.body.productID;
  let productName = req.body.productName;
  let productDescription = req.body.productDescription;
  let productPrice = req.body.productPrice;
  let productStock = req.body.productStock;
  let productCategory = req.body.productCategory;
  let productImageURL = req.body.productImageURL;

  const products = [
    {
      objectID: productID,
      productName: productName,
      productDescription: productDescription,
      productPrice: productPrice,
      productStock: productStock,
      productCategory: productCategory,
      productImageURL: productImageURL,
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
    res.render("merchant/addProduct", {
      title: "Merchant - AddProduct",
      style: "merchant",
      navbar: "merchant",
    });
  });
}); //addProduct to db

router.get("/updateProduct/:id", (req, res) => {
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
    })
    .catch((err) => {
      console.log(err);
    });
}); //getUpdate Interface

router.put("/updateProduct/saveUpdate/:id", (req, res) => {
  let productID = req.body.productID;
  let productName = req.body.productName;
  let productDescription = req.body.productDescription;
  let productPrice = req.body.productPrice;
  let productStock = req.body.productStock;
  let productCategory = req.body.productCategory;
  let productImageURL = req.body.productImageURL;

  const products = [
    {
      objectID: productID,
      productName: productName,
      productDescription: productDescription,
      productPrice: productPrice,
      productStock: productStock,
      productCategory: productCategory,
      productImageURL: productImageURL,
    },
  ];

  //updateObject
  index.saveObjects(products).then(({productID})=>{
    console.log(productID)
  })

  Product.update(
    {
      productID,
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
      productImageURL
    },
    {
      where: {
        productID: req.params.id,
      },
    }
  )
    .then((product) => {
      res.redirect("/merchant/displayProduct");
    })
    .catch((err) => {
      console.log(err);
    });
}); //updateExisting Products

router.get("/displayProduct", (req, res) => {
  Product.findAll({})
    .then((products) => {
      res.render("merchant/displayProduct", {
        products: products,
      });
    })
    .catch((err) => console.log(err));
}); //getExsiting Products

router.get("/deleteProduct/:id", (req, res) => {
  let productID = req.params.id;

  index.deleteObject(productID).catch((err) => {
    console.log(err);
  });

  Product.findOne({
    where: { productID: productID },
  })
    .then((product) => {
      if (productID == null) {
        res.redirect("/");
      } else {
        Product.destroy({
          where: {
            productID: productID,
          },
        }).then((product) => {
          res.redirect("/merchant/displayProduct");
        });
      }
    })
    .catch((err) => {
      console.log;
    });
}); //deleteExisting Products

router.post("/upload", (req, res) => {
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
