const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger.js");
var bcrypt = require("bcryptjs");
const User = require("../models/User_model");
const Product = require("../models/productModel.js");
const ensureAuthenticated = require("../helpers/auth");
const { ensureMerchantAuthenticated } = require("../helpers/auth");
const fs = require("fs");
const uploadS3 = require("../helpers/uploadS3");

//Algolia
const algoliasearch = require("algoliasearch");
const client = algoliasearch("97Y32174KO", "d371533080d456f5aaedd6716056c612");
const index = client.initIndex("Products");

/*
router.get('/signup', (req, res) => {

    res.render('merchant/sign_up', {title:"Merchant - SignUp", style:"signup_form"});

});*/

router.get("/signup", (req, res) => {
  res.render("merchant/sign_up2", {
    title: "Merchant - SignUp",
    style: "login_form",
  });
});

router.post("/signup", (req, res) => {
  // TEST
  let errors = [];

  // Retrieves fields from register page from request body
  let { contact_number, email, password, c_password, shop_name } = req.body;

  // Checks if both passwords entered are the same
  if (password !== c_password) {
    errors.push("Passwords do not match");
  }

  // Checks that password length is more than 4
  if (password.length < 4) {
    errors.push("Password must be at least 4 characters");
  }

  if (errors.length > 0) {
    res.render("user/sign_up", {
      title: "Sign Up",
      style: "signup_form",
      shop_name,
      contact_number,
      email,
      errors,
    });
  } else {
    console.log("no errors");
    // If all is well, checks if user is already registered
    User.findOne({ where: { email: req.body.email } }).then((user) => {
      if (user) {
        // If user is found, that means email has already been
        // registered
        /*
                    res.render('user/sign_up',  {
                        error: 'email: ' + user.email + ' already registered',
                        title:"Sign Up", 
                        style:"signup_form", 
                        first_name, 
                        last_name,
                        username,
                        email
                    
                    }); */
        errors.push("email: " + user.email + " already registered ");
      }

      User.findOne({ where: { contact_number: req.body.contact_number } }).then(
        (user2) => {
          if (user2) {
            errors.push(
              "contact_number: " + user2.contact_number + " already in use"
            );
            res.render("user/sign_up", {
              errors,
              title: "Sign Up",
              style: "signup_form",
              shop_name,
              contact_number,
              email,
            });
          } else {
            if (errors.length > 0) {
              res.render("user/sign_up", {
                errors,
                title: "Sign Up",
                style: "signup_form",
                shop_name,
                contact_number,
                email,
              });
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
          }
        }
      );
    });
  }
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
}); //getAdd Interface

router.post("/addProduct", (req, res) => {
  let productID = req.body.productID;
  let productName = req.body.productName;
  let productDescription = req.body.productDescription;
  let productPrice = req.body.productPrice;
  let productStock = req.body.productStock;
  let productCategory = req.body.productCategory;

  //upload Image
  uploadS3(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      if (req.file === undefined) {
        console.log("undefined image");
      } else {
        console.log(`${req.file.location}`);
      }
    }
  });

  //create Product in remote Algolia index
  const products = [
    {
      objectID: productID,
      productName: productName,
      productDescription: productDescription,
      productPrice: productPrice,
      productStock: productStock,
      productCategory: productCategory,
    },
  ];
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
    productID,
    productName,
    productDescription,
    productPrice,
    productStock,
    productCategory,
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

  Product.update({
    productID,
    productName,
    productDescription,
    productPrice,
    productStock,
    productCategory,
  },{
    where:{
      productID: req.params.id
    }
  }).then((product)=>{
    res.redirect('/');
  }).catch((err) => {
    console.log(err);
  });
}); //updateExisting Products

/*
router.get(); //getExsiting Products




*/

module.exports = router;
