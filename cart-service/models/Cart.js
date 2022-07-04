const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Cart = new schema(
  {
    userId: { type: String, required: true },
    items_id : { type: [Number], required: true },
      items_quantity : {type: [Number],required: true},
      items_price: {type: [Number],required: true},
      total: {type: Number,required: true}
  },
  {
    timestamps: true,
  }
);

module.exports = CartModel = mongoose.model("Cart", Cart);
