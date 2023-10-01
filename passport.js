const express = require("express");
const app = express();
const session = require("express-session");
const store = new session.MemoryStore();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "f4z4gs$Gcg",
    cookie: { maxAge: 300000000, secure: false },
    saveUninitialized: false,
    resave: false,
    store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Sample user data for demonstration purposes
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  if (!user) {
    return done(null, false);
  }
  done(null, user);
});

passport.use(
  new LocalStrategy(function (username, password, cb) {
    const user = users.find((user) => user.username === username);
    if (!user) {
      return cb(null, false);
    }
    if (user.password !== password) {
      return cb(null, false);
    }
    return cb(null, user);
  })
);

// Complete the logout handler below:
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("profile");
  }
);

app.get("/profile", (req, res) => {
  res.render("profile", { user: req.user });
});

app.post("/register", (req, res) => {
  // Replace this section with your actual user registration logic
  const { username, password } = req.body;
  // Simulate user creation
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  res.status(201).json({
    msg: "New user created!",
    newUser,
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
