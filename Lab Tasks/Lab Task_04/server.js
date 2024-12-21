
const express = require("express");
let app = express();

const ProductModel = require("./models/product.model");
const cookieParser = require("cookie-parser");
const session = require("express-session");
Order = require('./models/order.model');
app.use(cookieParser());
app.use(session({ secret: "My session secret" }));
const mongoose = require("mongoose");
// require package layout options in html rendering
var expressLayouts = require("express-ejs-layouts");
// publically accessible assets placed in public folder are exposed
app.use(express.static("public"));
app.use(express.static("uploads"));
// add a middleware to parse body data for form submission
app.use(express.urlencoded());
// setup view engine. ejs must be installed
app.set("view engine", "ejs");
app.use(expressLayouts);
//add as many routers as you want
// idea is to have seperate files for similar routes

let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);
let ordersRouter = require("./routes/admin/orders.router");
app.use(ordersRouter);
let categoryRouter = require("./routes/admin/category.router");
const Category = require("./models/category.model");
app.use(categoryRouter);

// add as many routes as you want like below
//each route is distinguished according to two paramaters 1. url 2. method (http)

// Middleware to add cart items count to all views
app.use((req, res, next) => {
  const cartItemsCount = req.cookies.cart 
      ? Object.keys(JSON.parse(req.cookies.cart)).length 
      : 0;
  
  // Pass cart items count to all views
  res.locals.cartItemsCount = cartItemsCount;
  next();
});

// Routes
//  app.use(productsRouter);

// app.get("/", async (req, res) => {
//   let products = await ProductModel.find().populate("category");
//   res.render("home", { products });
// });

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


// Display Checkout Page
app.get('/checkout', (req, res) => {
  res.render('checkout', { cart: getCartFromCookies(req) });
});

// Handle Checkout Form Submission
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
        console.log("Order saved:", newOrder);

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
