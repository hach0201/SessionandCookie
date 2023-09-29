const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const app = express();
const port = 3000;

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(session({
  secret: 'hajar99',
  resave: false,
  saveUninitialized: true,
}));
app.set('view engine', 'ejs');

// Server Variable to Store User Data
const users = [];

// Your registration, login, and other routes will go here

// Registration Form
app.get('/register', (req, res) => {
  res.render('register'); // Create an EJS template for the registration form
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.redirect('/login');
});

// Login Form
app.get('/login', (req, res) => {
  res.render('login'); // Create an EJS template for the login form
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = username; // Store user's unique identifier in the session
    res.cookie('sessionId', req.session.id, { maxAge: 3600000 }); // Set a session cookie (adjust maxAge as needed)
    res.redirect('/dashboard');
  } else {
    res.send('Invalid username or password');
  }
});

// Protected Route
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Welcome, ${req.session.userId}! This is your dashboard.`);
});

// Logout Functionality
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('sessionId'); // Clear the session cookie
    res.redirect('/login');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
