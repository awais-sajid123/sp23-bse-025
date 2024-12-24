const express = require("express");
let router = express.Router();
let Product = require("../../models/product.model");
let category = require("../../models/category.model"); 
let multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Directory to store files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});
const upload = multer({ storage: storage });

router.get("/admin/dashboard", (req, res) => {
  res.render("admin/login-signup", {layout: false});
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
const fs = require("fs");

router.post("/admin/products/edit/:id", upload.single("file"), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id).populate('category');

    // Update the product fields with the submitted data
    product.title = req.body.title; // Assuming you still want to keep the title field, even though it's optional in the form
    product.description = req.body.description;
    product.price = req.body.price;
    product.isFeatured = Boolean(req.body.isFeatured); // Ensure it's a boolean
    product.category = req.body.category; // Update category ID
    
    // Update the gender and size if provided
    product.gender = req.body.gender; // New gender field
    product.size = req.body.size; // New size field

    // If a new image is uploaded, update the picture field
    if (req.file) {
      product.picture = req.file.filename; // Save the new filename in the database
    }

    // Save the updated product in the database
    await product.save();
    return res.redirect("/admin/products/1"); // Redirect after saving

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong while editing the product');
  }
});




router.get("/admin/products/create", async (req, res) => {
  let Category = require("../../models/category.model"); 
  let categories = await Category.find(); 
  res.render("admin/product-form", { layout: "admin/admin-layout", categories }); 
});
router.post(
  "/admin/products/create",
  upload.single("file"),
  async (req, res) => {
    // return res.send(req.file);
    let newProduct = new Product(req.body);
    if (req.file) newProduct.picture = req.file.filename;
    newProduct.isFeatured = Boolean(req.body.isFeatured);
    await newProduct.save();
    // return res.send(newProduct);
    return res.redirect("/admin/products/1");
  }
);
router.get("/admin/products", async (req, res) => {
  // Count total products
  let totalRecords = await Product.countDocuments();
  let query = req.query.q || ""; 
  if (totalRecords <= 5) {
    // If products are less than or equal to 5, fetch all and display
    let products = await Product.find().populate("category").sort({ title: 1 }); // Default sort by title ascending
    return res.render("admin/products", { 
      layout: "admin/admin-layout", 
      products, 
      page: 1, 
      totalRecords, 
      totalPages: 1,
      sortField: "title", 
      sortOrder: "asc" ,
      searchQuery: query,
    });
  } else {
    // Redirect to the paginated route
    return res.redirect("/admin/products/1");
  }
});
router.get("/admin/products/:page?", async (req, res) => {
  let page = req.params.page ? Number(req.params.page) : 1;
  let pageSize = 5;
  let query = req.query.q || ""; // Search query
  let categoryFilter = req.query.category || ""; // Category filter
  let featuredFilter = req.query.isFeatured || ""; // Featured filter

  // Sorting parameters
  let sortField = req.query.sortField || "title";
  let sortOrder = req.query.sortOrder || "asc";
  let sortOptions = {};
  sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

  // Build the filter object
  let filter = {};

  if (query) {
    filter.$or = [
      { category: { $regex: query, $options: "i" } },
      { "category.title": { $regex: query, $options: "i" } },
    ];
  }

  if (categoryFilter) {
    filter.category = categoryFilter; // Matches exact category ID
  }

  if (featuredFilter) {
    filter.isFeatured = featuredFilter === "true"; // Matches boolean value
  }

  // Fetch filtered, sorted, and paginated products
  let products = await Product.find(filter)
    .populate("category")
    .sort(sortOptions)
    .limit(pageSize)
    .skip((page - 1) * pageSize);

  let totalRecords = await Product.countDocuments(filter);
  let totalPages = Math.ceil(totalRecords / pageSize);

  // Fetch all categories for the filter dropdown
  let categories = await category.find();

  res.render("admin/products", {
    layout: "admin/admin-layout",
    products,
    categories,
    page,
    totalRecords,
    totalPages,
    sortField,
    sortOrder,
    searchQuery: query,
    categoryFilter,
    featuredFilter,
  });
});


module.exports = router;



