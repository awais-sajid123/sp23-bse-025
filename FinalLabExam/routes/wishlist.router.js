const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Add to wishlist
router.post('/wishlist/add/:productId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    } else {
      await Wishlist.create({ userId: req.user._id, products: [req.params.productId] });
    }
    res.redirect('/wishlist');
  } catch (err) {
    console.error('Error adding product to wishlist:', err); // Add this line for debugging
    res.status(500).send('Error adding product to wishlist');
  }
});

// View wishlist
router.get('/wishlist', isLoggedIn, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    const products = wishlist ? await Product.find({ _id: { $in: wishlist.products } }) : [];
    res.render('wishlist', { wishlist: products });
  } catch (err) {
    console.error('Error fetching wishlist:', err); // Add this line for debugging
    res.status(500).send('Error fetching wishlist');
  }
});

module.exports = router;
