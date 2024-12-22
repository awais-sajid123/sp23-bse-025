const express = require("express");
let router = express.Router();
let Category = require("../../models/category.model"); 


router.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", { layout: "admin/admin-layout" });
});


router.get("/admin/categories", async (req, res) => {
  let categories = await Category.find(); 
  res.render("admin/categories", { layout: "admin/admin-layout", categories });
});


router.get("/admin/categories/create", (req, res) => {
  res.render("admin/category-form", { layout: "admin/admin-layout" });
});


router.post("/admin/categories/create", async (req, res) => {
  let newCategory = new Category(req.body); 
  await newCategory.save();
  res.redirect("/admin/categories");
});


router.get("/admin/categories/edit/:id", async (req, res) => {
  let category = await Category.findById(req.params.id); 
  if (!category) {
    return res.status(404).send("Category not found");
  }
  res.render("admin/category-edit-form", {
    category,
    layout: "admin/admin-layout",
  });
});

router.post("/admin/categories/edit/:id", async (req, res) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).send("Category not found");
  }
  category.title = req.body.title;
  category.description = req.body.description;
  await category.save();
  res.redirect("/admin/categories");
});

router.get("/admin/categories/delete/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect("/admin/categories");
});

module.exports = router;
