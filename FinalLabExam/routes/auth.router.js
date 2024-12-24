const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error signing up');
  }
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/wishlist',
  failureRedirect: '/login',
  failureFlash: true
}));

// Handle logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
