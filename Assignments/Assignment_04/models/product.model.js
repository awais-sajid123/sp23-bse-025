


const mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
  
  description: String,
  price: Number,
  picture: String,
  isFeatured: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, 
  gender:String,
  size:String,
});

let Product = mongoose.model("Product", productSchema);

module.exports = Product;

