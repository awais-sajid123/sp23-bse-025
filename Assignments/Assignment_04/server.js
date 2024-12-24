const express = require("express");
const User = require("./models/auth/user");
const passport = require("passport"); 
const dotenv = require('dotenv')
const flash = require('connect-flash');
dotenv.config()
let app = express();

/*google aouth 2.0 */

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/callback",
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.email,
          name: profile.displayName
        });
        await user.save();
      }
      console.log('user_', user)
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

const ProductModel = require("./models/product.model");
const cookieParser = require("cookie-parser");
const session = require("express-session");
Order = require('./models/order.model');
app.use(cookieParser());
app.use(session({ secret: "My session secret" }));
app.use(passport.initialize()); 
app.use(passport.session()); 
/*oauth apis for goolge provider */
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/auth/google/failure'
}));
const mongoose = require("mongoose");
var expressLayouts = require("express-ejs-layouts");
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.use(expressLayouts);
// idea is to have seperate files for similar routes
let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);
let ordersRouter = require("./routes/admin/orders.router");
app.use(ordersRouter);
let categoryRouter = require("./routes/admin/category.router");
const Category = require("./models/category.model");
app.use(categoryRouter);
let authRouter = require("./routes/admin/auth");
app.use(authRouter);
// Middleware to add cart items count to all views
app.use((req, res, next) => {
  const cartItemsCount = req.cookies.cart 
      ? Object.keys(JSON.parse(req.cookies.cart)).length 
      : 0;
  
  // Pass cart items count to all views
  res.locals.cartItemsCount = cartItemsCount;
  next();
});
// Helper function to get cart from cookies
function getCartFromCookies(req) {
  try {
      return req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  } catch (error) {
      console.error("Error parsing cart cookie:", error);
      return {};
  }
}
// Cart route
const cartRouter = require('./routes/admin/cart.router');
app.use(cartRouter);
// Checkout routes
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
        // console.log("Order saved:", newOrder);

        res.cookie('cart', JSON.stringify({}), { maxAge: 0 }); // Clear the cart
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
  let ProductModel = require("./models/product.model");
  let products = await ProductModel.find().populate("category");
  res.render("home", { products });
});
app.get("/admin/signup", (req, res) => {

  res.render("admin/signup");
});
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
// Connect to MongoDB
let connectionString = "mongodb://localhost:27017/my_store";
mongoose
  .connect(connectionString)
  .then(() => {
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.log(err.message);
  });
app.listen(4000, () => {
  console.log("Server started at localhost:4000");
});
