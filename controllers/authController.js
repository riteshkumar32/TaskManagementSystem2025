const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('login', { user: req.user, messages: req.flash() });
};

exports.getSignup = (req, res) => {
  res.render('signup', { user: req.user, messages: req.flash() });
};

exports.postSignup = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];
  if (!name || !email || !password || !password2) errors.push({ msg: 'Please enter all fields' });
  if (password !== password2) errors.push({ msg: 'Passwords do not match' });
  if (password && password.length < 6) errors.push({ msg: 'Password must be at least 6 characters' });

  if (errors.length) {
    req.flash('error', errors.map(e => e.msg).join(' | '));
    return res.redirect('/signup');
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/signup');
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email: email.toLowerCase(), password: hashed });
    await user.save();
    req.flash('success_msg', 'You are registered and can log in');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/signup');
  }
};
// controllers/authController.js
exports.logout = (req, res, next) => {
  // Use callback form (Passport >= 0.6)
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }

    // Defensive: if session exists, destroy it
    if (req.session) {
      req.session.destroy(function(err2) {
        if (err2) console.error('Session destroy error:', err2);
        res.clearCookie('connect.sid');
        return res.redirect('/login');
      });
    } else {
      // No session object present — still clear cookie and redirect
      res.clearCookie('connect.sid');
      return res.redirect('/login');
    }
  });
};

