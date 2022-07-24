const User = require("../controllers/user.controller");
const Order = reqiure("../controllers/order.controller")
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyAuth")

const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;
router.post("/register", User.registration);
router.post("/login",User.login);
router.post("/createOrder/:cartid/:uid",Order.createOrder)
router.get("/account",User.getDetails)
router.get("getitemdetails/:id",User.getItemDetails)
router.put("/account",User.updateUser)
module.exports = router;
