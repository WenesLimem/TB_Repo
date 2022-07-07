const User = require("../models/users");
const Order = require("../models/orders");
const client = require("prom-client");

const api = require('@opentelemetry/api');
const tracer = require("../tracing")("users-service");
const http = require("http");
const {trace} = require("@opentelemetry/api");

// adding a register
let register = new client.Registry();
const nb_of_orders = new client.Counter({
    name: "nb_of_orders",
    help: "Number of orders",
});

exports.createOrder = async (req, res) => {
    nb_of_orders.inc(1);
    // calling the function handling the request
    let cartContent = fetchCartContent();

    try {
        const result = Order.create(cartContent);

        nb_of_orders.inc(1);
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



}

async function fetchCartContent() {
    let cartContent;
    const span = tracer.startSpan('fetch-cart-content');
    api.context.with(api.trace.setSpan(api.context.active(), span), () => {
        http.get({
            host: 'localhost',
            port: 4003,
            path: '/getCartContent',
        }, (response) => {
            const body = [];
            response.on('data', (chunk) => body.push(chunk));
            cartContent = body;
            response.on('end', () => {
                console.log(body.toString());
                span.end();
            });
        });
    });


    return cartContent || "empty cart";
}

register.registerMetric(nb_of_orders);