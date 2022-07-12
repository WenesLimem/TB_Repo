const Cart = require("../models/Cart");
const api = require('@opentelemetry/api');
const tracer = require('../tracing')('carts-service');
// Primary CRUD for posts
const client = require('prom-client');
const http = require("http");

// adding a register 
let register = new client.Registry();


//---------------------------------------------------------//

const CreatedCarts = new client.Counter({
    name: "created_carts", help: "Number of created carts"
})
const EmptiedCarts = new client.Counter({
    name:"emptied_carts",help:"Number of emptied carts"
})


// instrumented
exports.getCart = async (req, res) => {
    const span = tracer.startSpan("get-cart-handler", undefined)
    const cart_id = await Cart.findById(req.params.id).exec();

    res.status(200).json({cart_id});
    span.end(Date.now());
};

// instrumented
exports.getCartContent = async (req, res) => {

    const currentSpan = api.trace.getSpan(api.context.active());
    // Display traceid in the terminal
    console.log(`Fetching cart from db , traceId: ${currentSpan.spanContext().traceId}`);
    const span = tracer.startSpan('handleRequest', {
        kind: 1, // server
        attributes: {key: 'value'},
    });
    span.addEvent('invoking handleRequest');
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json({
            data: cart,
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};

// instrumented
exports.addItemToCart = async (req, res) => {
    const span = tracer.startSpan('add Item to cart');
    // params
    const customerId = req.params.userid;
    // body
    const itemId = req.body.id;
    const qty = Number.parseInt(req.body.qty);
    const cart = await Cart.findOne({customerId: customerId});
    api.context.with(api.trace.setSpan(api.context.active(), span), async () => {
        await http.get({
                host: 'localhost',
                port: 4002,
                path: '/getItem/' + itemId,
            },
            (response) => {
                const body = []
                response.on('data', (chunk) => {
                    body.push(chunk);
                    const  productDetails = JSON.parse(body);
                    const unitPrice = productDetails.price;
                    const itemId = productDetails._id;
                    // business logic
                    //------------------------------------------------------------------------------//
                    try {
                        if (!body) {
                            return res.status(500).json({
                                type: "Could not find item details",
                                msg: "Invalid request"
                            })
                        }
                        console.log("Looking for an active cart")
                        // existing cart
                        if (cart) {
                            console.log("A cart is found ! updating the cart ...")
                            // check if item exists
                            //console.log(cart.items.productId)
                            const indexFound = cart.items.findIndex(item => item.productId.equals(itemId));
                            // check if item exists in cart, then we just update quantity, price, total
                            if (indexFound !== -1) {
                                console.log("Found item in cart, updating item info")
                                cart.items[indexFound].quantity = cart.items[indexFound].quantity + qty;
                                cart.items[indexFound].total = cart.items[indexFound].quantity * unitPrice;
                                cart.items[indexFound].price = unitPrice;
                                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                                cart.save(cart);
                            } else if (qty > 0) {
                                console.log("Add new item to cart")
                                cart.items.push({
                                    productId: itemId,
                                    quantity: qty,
                                    price: unitPrice,
                                    total: unitPrice * qty
                                })
                                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                                cart.save(cart);
                            }
                        }
                        // non exiting cart => we create a new one and add item to it
                        else {
                            console.log("No cart found, creating a new one and adding item to it")
                            let total = qty*unitPrice;
                            const cartData = {
                                customerId: customerId,
                                items: [{
                                    productId: itemId,
                                    price: unitPrice,
                                    quantity: qty,
                                    total: total

                                }],
                                subTotal: total
                            }
                            Cart.create(cartData);
                            CreatedCarts.inc(100);
                        }
                    }
                     catch (err) {
                        console.log(err);
                    }
                    //---------------------------------------------------------------------------//
                })
                response.on('end', () => {
                    span.end();
                });
            })
        console.log(cart);
        res.status(200).json({
            type: "success",
            msg: "Added item to cart",
            data: cart
            //data: data
        })
    })
};

//instrumented
exports.createCart = async (req, res) => {
    const span = tracer.startSpan("create-cart")
    CreatedCarts.inc(100);
    // Getting cart required information
    const userId = req.body.userId;
    const cart = {customerId: userId};
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
// instrumented
exports.emptyCart = async (req, res) => {
    const cartId = req.params.cartId;
    const span = tracer.startSpan("empty-cart-handler")
    try {
        let cart = await Cart.findById(cartId);
        cart.items = [];
        cart.subTotal = 0
        let data = await cart.save();
        span.addEvent("saving data to db")
        res.status(200).json({
            type: "success",
            mgs: "Cart Has been emptied",
            data: data
        })
        span.end(Date.now())
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something Went Wrong",
            err: err
        })
        span.addEvent("Something went wrong while connecting to the db").end(Date.now());
    }
    EmptiedCarts.inc(100)
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
register.registerMetric(CreatedCarts)
// Metrics labels
register.setDefaultLabels({
    app: 'carts-api'
});
// tell the client what to scrape
client.collectDefaultMetrics({register});
  