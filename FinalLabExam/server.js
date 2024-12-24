const express = require("express");
const dotenv = require('dotenv');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy; // Add this line
const bcrypt = require('bcrypt'); // Add this line
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const ProductModel = require("./models/product.model");
const User = require("./models/user.model"); // Add this line
const WishlistRouter = require("./routes/wishlist.router");
const AuthRouter = require("./routes/auth.router");
let app = express();

app.use(cookieParser());
app.use(session({
  secret: "My session secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(expressLayouts);

let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);
let ordersRouter = require("./routes/admin/orders.router");
app.use(ordersRouter);
let categoryRouter = require("./routes/admin/category.router");
const Category = require("./models/category.model");
app.use(categoryRouter);
app.use(WishlistRouter);
app.use(AuthRouter);

app.use((req, res, next) => {
  const cartItemsCount = req.cookies.cart 
      ? Object.keys(JSON.parse(req.cookies.cart)).length 
      : 0;
  
  res.locals.cartItemsCount = cartItemsCount;
  next();
});

function getCartFromCookies(req) {
  try {
      return req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  } catch (error) {
      console.error("Error parsing cart cookie:", error);
      return {};
  }
}

const cartRouter = require('./routes/admin/cart.router');
app.use(cartRouter);

async function calculateTotal(cart) {
    let total = 0;
    const productIds = Object.keys(cart);

    const products = await ProductModel.find({ _id: { $in: productIds } });

    products.forEach(product => {
        const quantity = cart[product._id.toString()] || 1;
        total += product.price * quantity;
    });

    return total;
}

app.get('/checkout', (req, res) => {
  res.render('checkout', { cart: getCartFromCookies(req) });
});

app.post('/confirmation', async (req, res) => {
    const { name, email, address, paymentMethod } = req.body;

    if (!name || !email || !address || !paymentMethod) {
        return res.status(400).send('All fields are required');
    }

    try {
        const cart = getCartFromCookies(req);
        const total = await calculateTotal(cart);

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

        res.cookie('cart', JSON.stringify({}), { maxAge: 0 });
        res.redirect('/confirmation');
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).send('Something went wrong. Please try again.');
    }
});

app.get('/confirmation', (req, res) => {
res.render('confirmation', { message: 'Your order has been placed successfully!' });
});

app.get("/", async (req, res) => {
  let products = await ProductModel.find().populate("category");
  res.render("home", { products });
});

app.get("/admin/signup", (req, res) => {
  res.render("admin/signup");
});

let connectionString = "mongodb://localhost:27017/my_cross_stitichstore";
mongoose
  .connect(connectionString)
  .then(() => {
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.log(err.message);
  });
app.listen(9000, () => {
  console.log("Server started at localhost:9000");
});
