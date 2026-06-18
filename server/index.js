import express from "express";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import LocalStrategy from "passport-local";
import cors from "cors";

import {
  getAllLines,
  getAllLinks,
  getAllStations,
  getLeaderboard,
} from "./games-dao.js";
import { login } from "./users-dao.js";
const app = new express();
const PORT = 3001;

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);

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

app.get("/api/network/complete", isLoggedIn, async (req, res) => {
  try {
    const stations = await getAllStations();
    const lines = await getAllLines();
    const links = await getAllLinks();

    const map = new Map();

    // I use map to group lines, so all elements of line_id 1 are together, ecc...
    links.forEach((l) => {
      if (!map.has(l.line_id)) {
        // If map doesn't already have an entry with this line id, then I create it as an empty array
        map.set(l.line_id, []);
      }

      map.get(l.line_id).push({
        // for each line id, I push the object with station id and stop order
        stationId: l.station_id,
        stopOrder: l.stop_order,
      });
    });

    const linesStations = Array.from(map.entries()).map(
      // for each entry in the map I get the lineid and stations
      ([lineId, stations]) => {
        return {
          line_id: lineId,
          station_ids: stations // sort stops' id by stop order
            .sort((a, b) => a.stopOrder - b.stopOrder)
            .map((stop) => stop.stationId),
        };
      },
    );

    res.status(200).json({
      stations,
      lines,
      linesStations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/leaderboard", isLoggedIn, async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
