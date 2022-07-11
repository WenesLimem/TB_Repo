const mongoose = require("mongoose");
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
const Order = new schema(
  {
    content: {type:String},
    paymentDetails: {type:CardSchema},
    value: {type:Number},
    order_date: {type:Date},
  },
  
  {
    timestamps: true,
  }
);

module.exports = UserModel = mongoose.model("order", Order);
