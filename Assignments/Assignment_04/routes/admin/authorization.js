// Middleware to check if the user is logged in
exports.checkLoggedIn = (req, res, next) => {
    console.log("Session User:", req.session.user);  // Log the session user to see if it's set
    if (req.session && req.session.user) {
        next(); // Proceed if the user is logged in
    } else {
        res.redirect("admin/login"); // Redirect to the login page if not logged in
    }
};
// Middleware to bypass login if the user is already logged in
exports.bypassLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        next(); // Proceed if the user is not logged in
    } else {
        res.redirect("/admin/dashboard"); // Redirect logged-in users to admin/products
 }
};