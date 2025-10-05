const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Passport config
require('./config/passport')(passport);

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  // NOTE: set to true so req.session exists before Passport may call regenerate()
  // For production, consider using a persistent session store (Redis, MongoStore)
  saveUninitialized: true,
  cookie: {
    // session cookie valid for 1 day (adjust if needed)
    maxAge: 24 * 60 * 60 * 1000,
    // secure: true // enable when using HTTPS
  }
}));

// server.js (add immediately after your app.use(session({...})))
app.use((req, res, next) => {
  if (!req.session) {
    // creating a minimal session object so passport won't fail
    req.session = {};
  }
  next();
});



// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/tasks', require('./routes/taskRoutes'));

// Root route redirect
app.get('/', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/tasks');
  res.redirect('/login');
});

// 404
app.use((req, res) => res.status(404).send('404 Not Found'));

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
