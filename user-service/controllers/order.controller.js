const User = require("../models/users");
const Order = require("../models/orders");
const client = require("prom-client");
// adding a register
let register = new client.Registry();
const nb_of_orders = new client.Counter({
  name: "nb_of_orders",
  help: "Number of orders",
});
exports.createOrder = async (req, res, next) => {
    nb_of_orders.inc(1);
    // auth required ,
    // get cart service
    let data = {
        items_id: [1, 2, 3],
        payment_method: "card",
        value: 98.56,
        order_date: "10.02.2022",
      }
  

      try {
        const result = await Order.create( data);
        res.status(200).json({
          message: "Order added successfully !",
          result,
        });
      } catch (error) {
        res.status(500).json({
          message: "An error occurred",
          error: error.message,
        });
      }
  };