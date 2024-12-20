const express = require("express");
let app = express();
const mongoose = require("mongoose");
var expressLayouts = require("express-ejs-layouts");
app.use(express.static("public"));
app.use(express.urlencoded());
// setup view engine. ejs must be installed
app.set("view engine", "ejs");
app.use(expressLayouts);
let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);
let categoryRouter = require("./routes/admin/category.router");
const Category = require("./models/category.model");
app.use(categoryRouter);


app.get("/", async (req, res) => {
  let ProductModel = require("./models/product.model");
  let products = await ProductModel.find().populate("category");
  res.render("home", { products });
});
let connectionString = "mongodb://localhost:27017/sp23-bse-a";
mongoose
  .connect(connectionString)
  .then(() => {
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.log(err.message);
  });
app.listen(5001, () => {
  console.log("Server started at localhost:5001");
});


