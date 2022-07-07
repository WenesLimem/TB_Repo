const Cart = require("../models/Cart");
const api = require('@opentelemetry/api');
const tracer = require('../tracing')('carts-service');
// Primary CRUD for posts
const client = require('prom-client');
const http = require("http");
const {get} = require("mongoose");
// adding a register 
let register = new client.Registry();


//---------------------------------------------------------//
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
    // const ctx = opentelemetry.context.active();
    const span = tracer.startSpan("get-cart-handler", undefined)
    const cart_id = (await getCart(req.params.id));
    res.status(200).json(cart_id);
    span.end(Date.now());
};

async function getCart(cart_id) {
    const span = tracer.startSpan("get-cart-from-db");
    const cart = await Cart.findOne({_id: cart_id}, "_id")
    span.addEvent("cart found")
    span.end(Date.now())
    return cart;
}

// not instrumented
exports.getCartContent = async (req, res) => {
    nb_validated_carts.inc(1);

    let result = {
        "cart_id": "62c47b1da5559d1ee04f0e27",
        "items_ids": [1, 2, 3],
        "quantities": [1, 1, 1],
        "prices": [2, 2, 4]
    };
    const currentSpan = api.trace.getSpan(api.context.active());
    // display traceid in the terminal
    console.log(`traceId: ${currentSpan.spanContext().traceId}`);
    const span = tracer.startSpan('handleRequest', {
        kind: 1, // server
        attributes: {key: 'value'},
    });
    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking handleRequest');
    res.send(result);

};

// not instrumented
exports.addItemToCart = async (req, res) => {
    // need to check if there is an existing cart to this user
    let cart;
    let item;
    const span = tracer.startSpan("adding item to cart")
    // if existing cart
    item = getItem(req.params.itemid)
    //cart = updateCartContent(req.params.cartid,req.params.itemid);
    span.addEvent(item);
    span.end(Date.now())
    //should add find a cart then add item to it .
    res.status(200).send(cart);
};


//instrumented
exports.createCart = async (req, res) => {
    const span = tracer.startSpan("create-cart")
    const item = getItem(req.params.id)

    nb_created_carts.inc(1);
    // Getting cart required information
    const userId = req.body.userId;
    const items_id = req.body.items_ids;
    const items_quantity = req.body.quantities;
    const items_price = req.body.prices;
    //Computing total
    //Need to convert prices to numeric
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
        const ctx = api.context.active();
        const childSpan = tracer.startSpan("db-create-cart", undefined, ctx);
        res.status(200).send({carts});
        childSpan.addEvent("db entry created")
        childSpan.end(Date.now())
    })
        .catch((err) => res.status(404).json({message: err.message}));

    span.end();
};

async function getItem(id) {
    let itemInfo;
    const span = tracer.startSpan('fetch-item-info');
    const path = "/getItem/" + id.toString();
    api.context.with(api.trace.setSpan(api.context.active(), span), () => {
        http.get({
            host: 'localhost',
            port: 4002,
            path: path,
        }, (response) => {
            const body = [];
            itemInfo = body;
            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => {

                span.addEvent("Fetched item info ")
                span.end();
            });
        });
    });
    return itemInfo || "empty item";
}

async function updateCartContent(cart_id, item_id) {
    const op = Cart.updateOne({_id: {cart_id}},
        {items_id: item_id}, function (err, docs) {
            if (err) {
                console.log(err)
            } else {
                console.log("Updated Docs : ", docs);
            }
        }
    );
    return op;

}

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
  