import express from "express";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import LocalStrategy from "passport-local";
const app = new express();
const PORT = 3001;

app.use(express.json());
app.use(morgan("dev"));

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function verify(email, password, cb) {
      const user = await login(email, password);

      if (!user) {
        return cb(null, false, "Invalid credentials");
      }
      return cb(null, user);
    },
  ),
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.authenticate("session"));

// Check if user is logged in middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // If user is authenticated, proceed with the request
    return next();
  }
  // If user is not loggedin , send the user a 401 unauthorized message
  return res.status(401).json({ error: "Unauthorized" });
};

// Login
app.post("/api/sessions", function (req, res, next) {
  // Try to authenticate using local strategy
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // If user does not exists, print the error message specified in the passportjs localstartegy func
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) return next(err);

      // If login is successfully, send the user got in the verify localstrategy func
      return res.json(req.user);
    });
  })(req, res, next);
});

// Check if the user is logged in
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Not authenticated" });
});

// Logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.get("/", isLoggedIn, (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
