// require express to make node server
// we do not use http as its more robust
const express = require("express");
//call express function to make server object
let app = express();
// require mongoose which is ORM Object Relational Model
const mongoose = require("mongoose");
// require package layout options in html rendering
var expressLayouts = require("express-ejs-layouts");
// publically accessible assets placed in public folder are exposed
app.use(express.static("public"));

// add a middleware to parse body data for form submission
app.use(express.urlencoded());

// setup view engine. ejs must be installed
app.set("view engine", "ejs");
app.use(expressLayouts);
//add as many routers as you want
// idea is to have seperate files for similar routes
let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);
let categoryRouter = require("./routes/admin/category.router");
const Category = require("./models/category.model");
app.use(categoryRouter);

// add as many routes as you want like below
//each route is distinguished according to two paramaters 1. url 2. method (http)


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
