const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Order = new schema(
  {
    content: {type:String},
    payment_method: {type:String},
    value: {type:Number},
    order_date: {type:Date},
  },
  
  {
    timestamps: true,
  }
);

module.exports = UserModel = mongoose.model("order", Order);
