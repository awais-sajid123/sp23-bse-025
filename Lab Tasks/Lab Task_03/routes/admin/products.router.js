const express = require("express");
let router = express.Router();
let Product = require("../../models/product.model");
let category = require("../../models/category.model"); 
router.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", { layout: "admin/admin-layout" });
});
router.get("/admin/products/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return res.redirect("back");
});
router.get("/admin/products/edit/:id", async (req, res) => {
  let product = await Product.findById(req.params.id);
  
  let categories = await category.find(); 
  res.render("admin/product-edit-form", {
    product,
    categories,
    layout: "admin/admin-layout",
  });
});
router.post("/admin/products/edit/:id", async (req, res) => {
  let product = await Product.findById(req.params.id).populate('category'); ;
  product.title = req.body.title;
  product.description = req.body.description;
  product.price = req.body.price;
  product.isFeatured = Boolean(req.body.isFeatured);
  product.category = req.body.category; 
  await product.save();
  return res.redirect("/admin/products");
});

router.get("/admin/products/create", async (req, res) => {
  let Category = require("../../models/category.model"); 
  let categories = await Category.find(); 
  res.render("admin/product-form", { layout: "admin/admin-layout", categories }); 
});

router.post("/admin/products/create", async (req, res) => {
  let newProduct = new Product(req.body);
  
  newProduct.isFeatured = Boolean(req.body.isFeatured);
  await newProduct.save();

  return res.redirect("/admin/products");
});
router.get("/admin/products", async (req, res) => {
  let products = await Product.find().populate("category"); 
  res.render("admin/products", { layout: "admin/admin-layout", products });
});

module.exports = router;
