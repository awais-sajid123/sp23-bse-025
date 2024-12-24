const Wishlist = require('../models/wishlist');
const Product = require('../models/product');

exports.postAddToWishlist = (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.user.id; // Assuming user is stored in req.user

    Product.findById(productId, product => {
        if (!product) {
            return res.redirect('/');
        }

        const wishlist = new Wishlist(userId, product.id, product.title, product.price, product.imageUrl);
        wishlist.save()
            .then(() => {
                res.redirect('/wishlist');
            })
            .catch(err => console.log(err));
    });
};

exports.getWishlist = (req, res, next) => {
    Product.fetchAll(products => {
        const wishlistProducts = products.filter(product => {
            // Assuming wishlist is stored in session
            return req.session.wishlist.includes(product.id);
        });
        res.render('shop/wishlist', {
            prods: wishlistProducts,
            pageTitle: 'Your Wishlist',
            path: '/wishlist'
        });
    });
};
