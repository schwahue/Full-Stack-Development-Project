const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

/* obsolete code - can be reused for search with refresh of page
router.get("/getProduct", (req, res) => {
  const { term } = req.query;

  Product.findAll(
    {
      where: { productName: { [Op.like]: "%" + term + "%" } },
    },
    (raw = "true")
  )
    .then((products) => {
      res.json(products); //return json object of all product matchin search key
      console.log(products);
    })
    .catch((err) => console.log(err));
});*/

router.get("/product/all", (req, res) => {
  Product.findAll({}, (raw = "true"))
    .then((products) => res.json(products))
    .catch((err) => console.log(err));
});

module.exports = router;
