const User = require("../controllers/user.controller");
const Order = reqiure("../controllers/order.controller")
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyAuth")

const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;
router.post("/register", User.registration);
router.post("/login",verifyToken,User.login);
router.put("/createOrder/:cartid/:uid",verifyToken,Order.createOrder)
router.get("/getDetails", verifyToken,User.getDetails)
router.get("getitemdetails/:id",User.getItemDetails)
module.exports = router;
