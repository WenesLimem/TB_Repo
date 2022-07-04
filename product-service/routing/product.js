const Product = require("../controllers/products.controller");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/verifyAuth");

// Primary CRUD routes

router.get("/getItem/:id", auth, Product.getItem);
router.get("/getItems/", auth, Product.getItems);

router.post("/createItem", auth, Product.createItem);
router.post("/deleteManyItems", auth, Product.deleteManyItems);

router.delete("/deleteItem/:id", auth, Product.deleteItem);

router.put("/updateItem/:id", auth, Product.updateItem);





module.exports = router;
