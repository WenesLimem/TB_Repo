const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const schema = mongoose.Schema;
const CardSchema = new schema({
        nameOnCard: {
            type: String
        },
        cardNumber: {
            type: String
        },
        ccv: {
            type: Number
        }
    }
)

const User = new schema(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        shippingAddress: {type: String},
        paymentDetails: {type: CardSchema},
        cartId: {type: Number},
        orders: [{type: String}]
    },
    {
        timestamps: true,
    }
);

module.exports = UserModel = mongoose.model("user", User);
