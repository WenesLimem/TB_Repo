const User = require("../models/users");
const Order = require("../models/orders");
const client = require("prom-client");
const api = require('@opentelemetry/api');
const tracer = require("../tracing")("users-service");
const http = require("http");
const {JAEGER_BAGGAGE_HEADER} = require("jaeger-client/dist/src/constants");

// adding a register
let register = new client.Registry();
const orders = new client.Counter({
    name: "orders",
    help: "Number of orders",
});

exports.createOrder = async (req, res) => {
    const user_id = req.params.uid;
    const cart_id = req.params.cartid;

    const paymentDetails = await User.find({_id:user_id},"paymentDetails -_id");

    orders.inc(100);
    // invoking the function handling the request
    const span = tracer.startSpan('fetch-cart-content');
    api.context.with(api.trace.setSpan(api.context.active(), span), () => {
        const path = "/buyCart/"+cart_id.toString();
        http.get({
            host: 'localhost',
            port: 4003,
            path: path,
        }, (response) => {
            const body = [];

            response.on('data', async (chunk) => {
                body.push(chunk)
                span.end(Date.now());
                const data = JSON.parse(body);
                const orderData = {
                    content: data.toString(),
                    order_data: Date.now()
                }

                const order = await Order.create(orderData);
                await order.save((err, uid) => {
                    User.updateOne({_id: user_id}, {orders: [order._id]}).exec();
                    console.log(order._id);
                });
                return res.status(200).json(order);
            });
            response.on('end', () => {
                span.end(Date.now());
            });
        });
    })
}


register.registerMetric(orders);