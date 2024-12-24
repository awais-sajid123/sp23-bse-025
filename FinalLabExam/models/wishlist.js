const db = require('../util/database');

module.exports = class Wishlist {
    constructor(userId, productId, title, price, imageUrl) {
        this.userId = userId;
        this.productId = productId;
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    save() {
        return db.execute(
            'INSERT INTO wishlist (userId, productId, title, price, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [this.userId, this.productId, this.title, this.price, this.imageUrl]
        );
    }

    static fetchAll(userId) {
        return db.execute('SELECT * FROM wishlist WHERE userId = ?', [userId]);
    }
};
