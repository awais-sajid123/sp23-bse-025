
const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  description: {
    type: String,
    default: "", 
  },
});


const Category = mongoose.model("Category", categorySchema);


module.exports = Category;
