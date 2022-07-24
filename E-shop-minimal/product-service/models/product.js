const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const schema = mongoose.Schema;

const Product = new schema(
    {
        name: {type: String, required: true},
        image: {type: String},
        description: {type: String},
        price: {type: Number},
        category: {type: [String]},
    },
    {
        timestamps: true,
    }
);

module.exports = ProductModel = mongoose.model("Product", Product);
