const User = require("../controllers/user.controller");
const Order = reqiure("../controllers/order.controller")
const express = require("express");
const router = express.Router();

router.post("/register", User.registration);
router.post("/login", User.login);
router.put("/createOrder", Order.createOrder)
router.get("/getDetails",User.getDetails)
module.exports = router;
