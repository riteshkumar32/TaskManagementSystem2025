const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getLogin, getSignup, postSignup, logout } = require('../controllers/authController');
const { ensureGuest } = require('../middleware/ensureAuth');

router.get('/login', ensureGuest, getLogin);
router.get('/signup', ensureGuest, getSignup);
router.post('/signup', postSignup);
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});
router.get('/logout', logout);

module.exports = router;
