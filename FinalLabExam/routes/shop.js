const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');
// ...existing code...

// Add route to display wishlist products after login
router.get('/wishlist', (req, res) => {
    if (req.isAuthenticated()) {
        wishlistController.getWishlist(req, res);
    } else {
        res.redirect('/login');
    }
});

// ...existing code...

module.exports = router;
