const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../../models/auth/user'); // Assuming you have the User model set up
const localUser = require('../../models/users.models'); // Make sure this is correct for your model import
const authorization = require("./authorization")
const router = express.Router();

// Route to display the login/signup page
router.get('/admin',(req, res) => {
    res.render('admin/login-signup', { layout: false });
});

// Signup route (handling form submission)
router.post('/admin/login-signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const user = new localUser({ name, email, password: hashedPassword });
        // Save the user to the database
        await user.save();
        // Redirect to the dashboard after signup
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.redirect('/admin');  // Redirect back to the signup page if there's an error
    }
});

// Route to display the login page
router.get('/login',(req, res) => {
    res.render('admin/login', { layout: false });
});

// Login route (handling form submission)
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await localUser.findOne({ email });
        if (user) {
            // Compare the password with the hashed password
            const validPassword = await bcrypt.compare(password, user.password);
            req.session.user={id:user._id,email:user.email}

            if (validPassword) {
                // If password is valid, redirect to the dashboard
               // res.render('/admin/dashboard',{layout:"admin/admin-layout"});
               res.render("admin/dashboard", { layout: "admin/admin-layout" });
               console.log("admin passed")

            } else {
                // If password is invalid, redirect to login page
                res.redirect('/login');
            }
        } else {
            // If user doesn't exist, redirect to login page
           // res.redirect('/login');
        }
    } catch (error) {
        console.error('Login error:', error);
      //  res.redirect('/login');
    }
});



// Logout route
router.get('/admin/logout',(req, res) => {
    req.session.destroy // Redirect to login/signup page after logout
    
});

module.exports = router;
