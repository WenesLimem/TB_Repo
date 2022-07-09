const Product = require("../models/product");
const api = require('@opentelemetry/api');
const tracer = require('../tracing')('products-service');
// Primary CRUD for posts

exports.getItem = async (req, res) => {
    // starting span
    const currentSpan = api.trace.getSpan(api.context.active());
    console.log(`traceId: ${currentSpan.spanContext().traceId}`);
    const span = tracer.startSpan('getIem-handler', {kind: 1});
    await Product.findOne({_id: req.params.id}, )
        .then((item) => res.status(200).json(item))
        .catch((err) => res.status(404).json({message: err.message}));
    span.addEvent('invoking handleRequest');
    span.end(Date.now())
};
exports.getItems = async (req, res) => {
    await Product.find("-_id")
        .then((posts) => res.status(200).json(posts))
        .catch((err) => res.status(404).json({message: err.message}));
};
exports.createItem = async (req, res) => {
    const span = tracer.startSpan("create-item-request");
    const item = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
    };
    span.addEvent("db-operation")
    // Check for duplicate items //
    const itemsHistory = await Product.findOne({name: item.name}).exec();
    if (itemsHistory) {
        return res.status(403).json({err: "Item already exists"});
    } else {
        Product.create(item)
            .then((products) => {
                res.status(200).send({products});
            })
            .catch((err) => res.status(404).json({message: err.message}));
    }
    span.end(Date.now());
};
exports.updateItem = async (req, res) => {
    Product.updateOne({_id: req.params.id}).exec(function (err, result) {
        res.status(200).send({success: true});
        if (err) {
            return err;
        }
    });
};
exports.deleteItem = async (req, res) => {
    Product.deleteOne({_id: req.params.id})
        .then(() => res.status(200).send({success: true}))
        .catch((err) => res.status(404).json({message: err.message}));
};
exports.deleteManyItems = async (req, res) => {
    const arrOfIds = req.body;
    const Item = await Product.deleteMany(arrOfIds[0])
        .then((items) => res.status(200).send({success: true}))
        .catch((err) => res.status(404).json({message: err.message}));
};

// Categories CRUD
