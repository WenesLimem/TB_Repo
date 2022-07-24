const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ItemSchema = new schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        price: {
            type: Number,
            required: false
        },
        quantity: {
            type: Number,
            default: 1,
            required: false
        },
        total:{
            type: String,
            required: false
        }
    }
    , {
        timestamps: true
    })
// Cart schema
// contains items and subtotal
// user database will contain a reference to cartID if a user has an active card.
const Cart = new schema(
    {
        customerId: {type: mongoose.Schema.Types.ObjectId, required:true},
        items: {type: [ItemSchema]},
        subtotal: {type: Number, default: 0}
    },
    {
        timestamps: true
    }
);


module.exports = CartModel = mongoose.model("Cart", Cart);
