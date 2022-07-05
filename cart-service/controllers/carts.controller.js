const Cart = require("../models/Cart");
const opentelemetry = require('@opentelemetry/api');
// Primary CRUD for posts
const client = require('prom-client');

// adding a register 
let register = new client.Registry();
const tracer = require("../tracing")("carts-service");
const api = require('@opentelemetry/api');
const http = require('http');
const nb_validated_carts = new client.Counter({
    name: "validated_carts_number",
    help: "Number of validated carts"
})
const nb_created_carts = new client.Counter({
    name: "number_of_created_carts",
    help: "Number of created carts"
})


// instrumented
exports.getCart = async (req, res) => {
    const ctx = opentelemetry.context.active();
    const span = tracer.startSpan("get-cart", undefined, ctx)
    await Cart.findOne({_id: req.params.id}, "_id")
        .then((posts) => res.status(200).json(posts))
        .catch((err) => res.status(404).json({message: err.message}));
    span.end(Date.now());

};

// not instrumented
exports.getCartContent = async (req, res) => {
    // this method will be called by user service whenever the user decides to buys the cart.
    nb_validated_carts.inc(1);
    // need cart content without user_id
    // basically we can retrieve them from previous request , but idk .
};

// not instrumented
exports.addItem = async (req, res) => {
    //should add find a cart then add item to it .
};

//instrumented
exports.createCart = async (req, res) => {
    const span = tracer.startSpan("create-cart")
    nb_created_carts.inc(1);
    // Estimate Adult Reading Time
    const userId = req.body.userId;
    const items_id = req.body.items_ids;
    const items_quantity = req.body.quantities;
    const items_price = req.body.prices;


    // computing total
    // need to convert prices to numeric
    let total = 0
    let x;
    for (let i = 0; i < items_price.length; i++) {
        // converting number to int then adding to table
        x = parseInt(items_price[i]);
        // adding number value to total
        total += x;
    }

    const cart = {
        userId: userId,
        items_id: items_id,
        items_quantity: items_quantity,
        items_price: items_price,
        total: total
    };
    span.addEvent("cart-creation")
    Cart.create(cart).then((carts) => {
        const ctx = opentelemetry.context.active();
        const childSpan = tracer.startSpan("db-create-cart", undefined, ctx);
        res.status(200).send({carts});
        childSpan.addEvent("db entry created")
        childSpan.end(Date.now())
    })
        .catch((err) => res.status(404).json({message: err.message}));

    span.end();
};
// not instrumented
exports.updateCart = async (req, res) => {
    Cart.updateOne({_id: req.params.id}).exec(function (err, result) {
        res.status(200).send({success: true});
        if (err) {
            return err;
        }
    });
};

// not instrumented
exports.deleteCart = async (req, res) => {
    Cart.deleteOne({_id: req.params.id})
        .then(() => res.status(200).send({success: true}))
        .catch((err) => res.status(404).json({message: err.message}));
};

// Metrics registration

register.registerMetric(nb_validated_carts);
register.registerMetric(nb_created_carts)

// Metrics labels
register.setDefaultLabels({
    app: 'carts-api'
});
// tell the client what to scrape
client.collectDefaultMetrics({register});
  