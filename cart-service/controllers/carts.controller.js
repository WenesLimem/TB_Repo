const Cart = require("../models/Cart");
const api = require('@opentelemetry/api');
const tracer = require('../tracing')('carts-service');
// Primary CRUD for posts
const client = require('prom-client');
const http = require("http");
const {get} = require("mongoose");
const axios = require("axios")
const {jsonEncoder} = require("zipkin");
const {response} = require("express");
// adding a register 
let register = new client.Registry();


//---------------------------------------------------------//
const Orders = new client.Counter({
    name: "orders", help: "Number of orders"
})
const CreatedCarts = new client.Counter({
    name: "created_carts", help: "Number of created carts"
})

// instrumented
exports.getCart = async (req, res) => {
    const span = tracer.startSpan("get-cart-handler", undefined)
    const cart_id = await Cart.findById(req.params.id);
    res.status(200).json(cart_id);
    span.end(Date.now());
};


// Instrumented
exports.getCartContent = async (req, res) => {

    // trace block
    //----------------------------------------------------------------//
    const currentSpan = api.trace.getSpan(api.context.active());
    // Display traceid in the terminal
    console.log(`Fetching cart from db , traceId: ${currentSpan.spanContext().traceId}`);
    const span = tracer.startSpan('handleRequest', {
        kind: 1, // server
        attributes: {key: 'value'},
    });
    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking handleRequest');
    // -------------------------------------------------------------//
    try {
        Orders.inc(1);
        const cart = await fetchCart(req.params.id);
        res.status(200).json({
            data: cart,
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}


exports.addItemToCart = async (req, res) => {

    const span = tracer.startSpan('fetch-item-info');
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
                            console.log(cart.items.productId)
                            const indexFound = cart.items.findIndex(item => item.productId === itemId);
                           // console.log(itemId)

                            console.log(indexFound)
                            // check if item exists in cart, then we just update quantity, price, total
                            if (indexFound !== -1) {
                                cart.items[indexFound].quantity = cart.items[indexFound].quantity + qty;
                                cart.items[indexFound].total = cart.items[indexFound].quantity * 12;
                                cart.items[indexFound].price = 12;
                                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                            }else if (qty > 0) {
                                console.log("Add new item to cart")
                                cart.items.push({
                                    productId: itemId,
                                    quantity: qty,
                                    price: 23,
                                    total: 23 * qty
                                })
                                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                                cart.save(cart);

                            }
                        }
                        else {
                            console.log("no cart found")
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    //---------------------------------------------------------------------------//
                })
                response.on('end', () => {
                    span.end();
                });
            })
        //let data = await cart.updasave(cart);
        console.log(cart);
        res.status(200).json({
            type: "success",
            msg: "Added item to cart",
            data: cart
            //data: data
        })
    })
   /*
            // if user dosent have a cart , we create a  new cart
            else if (!productDetails) {
                let price = parseInt(productDetails.price);
                let subtotal, total = price * qty;
                const cartData = {
                    customerId: customerId,
                    items: [{
                        productId: productId,
                        price: price,
                        quantity: qty,
                        total: total

                    }],
                    subTotal: subtotal
                }
                cart = await createCartAndAddItem(cartData);
                res.json(cart);
            } else {
                //do nothing
            }
        } catch (err) {
            console.log(err)
            res.status(400).json({
                type: "Invalid",
                msg: "Something Went Wrong",
                err: err
            })
        }

     */

};

async function createCartAndAddItem(cart) {
    const span = tracer.startSpan("createandadditemtocart-handler")
    const newItem = await Cart.create(cart);
    span.end(Date.now());
    return newItem
}

//instrumented
exports.createCart = async (req, res) => {
    const span = tracer.startSpan("create-cart")
    CreatedCarts.inc(1);
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

function getItemSpan(id) {
    const span = tracer.startSpan('fetch-item-info');
    const path = "http://localhost:4002/getItem/" + id.toString();
    const body = [];
    api.context.with(api.trace.setSpan(api.context.active(), span), async () => {
        const {data: response} = await http.get({
                host: 'localhost',
                port: 4002,
                path: '/getItem/' + id,
            },
            (response) => {
                response.on('data', (chunk) => {
                    body.push(chunk);
                    console.log("body from getItem():", body.toString())
                });
                response.on('end', () => {
                    span.end();

                });
            })


    })
}

async function updateCartContent(cart_id, item_id) {
    const op = Cart.updateOne({_id: {cart_id}}, {items_id: item_id}, function (err, docs) {
        if (err) {
            console.log(err)
        } else {
            console.log("Updated Docs : ", docs);
        }
    });
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

register.registerMetric(Orders);
register.registerMetric(CreatedCarts)

// Metrics labels
register.setDefaultLabels({
    app: 'carts-api'
});
// tell the client what to scrape
client.collectDefaultMetrics({register});
  