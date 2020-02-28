const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectId} = mongoose.Schema

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    name: String,
    price: Number,
    count: Number
  },
  { timestamps: true }
);

const CartItem = mongoose.model("CartItem", CartItemSchema);
const OrderSchema = new mongoose.Schema (
  {
    products: [CartItemSchema],
    transaction_id: {},
    amount: { type: Number },
    address: {
      street:{type: String},
      city:{type: String},
      state:{type: String},
      zip:{type: String},
      country:{type:String},
      phone:{type:String}
   },
    status: {
      type: String,
      default: "Not processed",
      enum: ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"] // enum means string objects
    },
    shippingTract :{
      type: String
    },
    updated: Date,
    user: { type: ObjectId, ref: "User" }
  },
  { timestamps: true }

);

const Order = mongoose.model('Order',OrderSchema);


module.exports ={Order,CartItem}
