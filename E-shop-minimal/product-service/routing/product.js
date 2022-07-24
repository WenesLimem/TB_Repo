const Product = require("../controllers/products.controller");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/verifyAuth");

// Primary CRUD routes

router.get("/getItem/:id", Product.getItem);
router.get("/getItems/", Product.getItems);

router.post("/createItem", Product.createItem);
router.post("/deleteManyItems", Product.deleteManyItems);
router.delete("/deleteItem/:id", Product.deleteItem);
router.put("/updateItem/:id", Product.updateItem);




module.exports = router;
