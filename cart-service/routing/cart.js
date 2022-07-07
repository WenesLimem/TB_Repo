const Cart = require("../controllers/carts.controller");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/verifyAuth");
// Primary CRUD routes

router.post("/createCart", Cart.createCart);
// need to add quantities as params in this uri
router.put("/updateCart/:id", Cart.updateCart);
router.delete("/deleteCart/:id", Cart.deleteCart);
router.get("/getCartContent",Cart.getCartContent)
// Buying action : Sends json format data to user service endpoint to be transformed into an order
router.get("/buyCart/", Cart.getCartContent);
router.post("/add")

module.exports = router;
