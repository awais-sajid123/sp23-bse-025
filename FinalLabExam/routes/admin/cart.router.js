const express = require("express");
const mongoose = require("mongoose");
const ProductModel = require("../../models/product.model");
const router = express.Router();

// Helper function to get cart from cookies
function getCartFromCookies(req) {
    try {
        return req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
    } catch (error) {
        console.error("Error parsing cart cookie:", error);
        return {};
    }
}

// Calculate total price
async function calculateTotal(cart) {
    let total = 0;
    const productIds = Object.keys(cart);

    // Fetch product prices from the database
    const products = await ProductModel.find({ _id: { $in: productIds } });

    products.forEach(product => {
        const quantity = cart[product._id.toString()] || 1;
        total += product.price * quantity;
    });

    return total;
}

// Cart route
router.get("/cart", async (req, res) => {
    try {
        let cart = getCartFromCookies(req);

        // Convert cart to array of product IDs
        const productIds = Object.keys(cart).map(id => new mongoose.Types.ObjectId(id));

        // Find products in cart
        let products = await ProductModel.find({ 
            _id: { $in: productIds } 
        });

        // Add quantity to products
        const productsWithQuantity = products.map(product => ({
            ...product.toObject(),
            quantity: cart[product._id] || 1
        }));

        res.render("cart", { 
            products: productsWithQuantity
        });
    } catch (error) {
        console.error("Cart loading error:", error);
        res.status(500).send("Error loading cart");
    }
});

// Add to cart route
router.get("/add-to-cart/:id", async (req, res) => {
    try {
        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid product ID");
        }

        // Get existing cart from cookies or initialize an empty cart
        let cart = getCartFromCookies(req);

        const productId = req.params.id.toString();

        // Increase quantity or set to 1
        cart[productId] = (cart[productId] || 0) + 1;

        // Store cart in cookies
        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 }); // Expire in 1 day

        // Redirect to cart
        res.redirect("/cart");
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).send("Error adding to cart");
    }
});

// Remove from cart route
router.get("/remove-from-cart/:id", async (req, res) => {
    try {
        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid product ID");
        }

        // Get existing cart from cookies
        let cart = getCartFromCookies(req);

        const productId = req.params.id.toString();

        // Remove product from cart
        delete cart[productId];

        // Store updated cart in cookies
        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 }); // Expire in 1 day

        // Redirect to cart
        res.redirect("/cart");
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).send("Error removing from cart");
    }
});

// Update cart quantity route
router.post("/update-cart-quantity", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(productId) || 
            isNaN(quantity) || 
            quantity < 1) {
            return res.status(400).send("Invalid input");
        }

        // Get existing cart from cookies
        let cart = getCartFromCookies(req);

        // Update quantity
        cart[productId.toString()] = parseInt(quantity);

        // Store updated cart in cookies
        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 }); // Expire in 1 day

        // Redirect to cart
        res.redirect("/cart");
    } catch (error) {
        console.error("Update cart quantity error:", error);
        res.status(500).send("Error updating cart quantity");
    }
});

// Checkout routes
router.get('/checkout', (req, res) => {
    res.render('checkout', { cart: getCartFromCookies(req) });
});

router.post('/confirmation', async (req, res) => {
    const { name, email, address, paymentMethod } = req.body;

    if (!name || !email || !address || !paymentMethod) {
        return res.status(400).send('All fields are required');
    }

    try {
        const cart = getCartFromCookies(req);
        const total = await calculateTotal(cart); // Updated to fetch total dynamically

        // Save order to database
        const newOrder = new Order({
            name,
            email,
            address,
            paymentMethod,
            cart,
            total,
            status: "Processing", 
            createdAt: new Date()
        });

        await newOrder.save();
        console.log("Order saved:", newOrder);

        res.cookie('cart', JSON.stringify({}), { maxAge: 0 }); // Clear the cart
        res.redirect('/confirmation');
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).send('Something went wrong. Please try again.');
    }
});

router.get('/confirmation', (req, res) => {
    res.render('confirmation', { message: 'Your order has been placed successfully!' });
});
module.exports = router;
