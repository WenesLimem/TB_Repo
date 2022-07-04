const mongoose = require("mongoose");
const schema = mongoose.Schema;

const User = new schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String},
    
    orders: [{ type: String }]
  },
  {
    timestamps: true,
  }
);

module.exports = UserModel = mongoose.model("user", User);
