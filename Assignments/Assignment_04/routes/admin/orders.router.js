const express = require('express');
const router = express.Router();
const Order = require('../../models/order.model');
const Product = require('../../models/product.model');

// Calculate total from cart
async function calculateTotal(cart) {
    let total = 0;
    const productIds = Object.keys(cart);

    // Fetch product prices from the database
    const products = await Product.find({ _id: { $in: productIds } });

    products.forEach(product => {
        const quantity = cart[product._id.toString()] || 1;
        total += product.price * quantity;
    });

    return total;
}

// Confirm an order
router.post('/admin/orders/confirm/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        // Only update total and status if not already confirmed
        if (order && order.status !== 'Confirmed') {
            const total = await calculateTotal(order.cart);
            await Order.findByIdAndUpdate(req.params.id, { status: 'Confirmed', total });
        }

        res.redirect('/admin/adminOrders');
    } catch (error) {
        console.error('Error confirming order:', error.message);
        res.status(500).send('Failed to confirm order');
    }
});

// Cancel an order
router.post('/admin/orders/cancel/:id', async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: 'Canceled' });
        await Order.findByIdAndDelete(req.params.id, { status: 'Canceled' });
        res.redirect('/admin/adminOrders');
    } catch (error) {
        console.error('Error canceling order:', error.message);
        res.status(500).send('Failed to cancel order');
    }
});

// Fetch all orders for admin
router.get('/admin/adminOrders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const enrichedCart = await Promise.all(Object.entries(order.cart).map(async ([productId, quantity]) => {
                const product = await Product.findById(productId);
                if (product) {
                    return {
                        productId,
                        title: product.title,
                        picture: product.picture || '',
                        quantity,
                        price: product.price,
                        subtotal: product.price * quantity
                    };
                } else {
                    return { productId, title: "Product Not Found", quantity, price: 0, subtotal: 0 };
                }
            }));

            return { ...order.toObject(), cart: enrichedCart };
        }));

        // Calculate total revenue
        const totalRevenue = orders
            .filter(order => order.status === 'Confirmed')
            .reduce((sum, order) => sum + order.total, 0);

        res.render('admin/adminOrders', {
            orders: enrichedOrders,
            totalRevenue,layout: "admin/admin-layout"
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
