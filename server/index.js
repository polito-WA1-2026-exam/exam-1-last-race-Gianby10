import express from "express";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import LocalStrategy from "passport-local";
import cors from "cors";
import dayjs from "dayjs";
import { body, param, validationResult } from "express-validator";

import {
  completeGame,
  getGameById,
  getLeaderboard,
  getLines,
  getLinesStations,
  getStations,
  startNewGame,
} from "./games-dao.js";
import { login } from "./users-dao.js";
import {
  createSegments,
  drawEventsFromSegments,
  getStartAndDestinationStationIds,
  groupStationsByLine,
} from "./utils.js";

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
    const stations = await getStations();
    const lines = await getLines();
    const linesStationsRows = await getLinesStations();

    const linesStations = groupStationsByLine(linesStationsRows);

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

app.get("/api/network/segments", isLoggedIn, async (req, res) => {
  const linesStationsRows = await getLinesStations();
  const linesStations = groupStationsByLine(linesStationsRows);
  const segments = createSegments(linesStations);
  try {
    res.status(200).json(segments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/games/start", isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    res.status(401).json("Unauthorized");
  }
  const linesStationsRows = await getLinesStations();
  const linesStations = groupStationsByLine(linesStationsRows);

  const startedAt = dayjs().toISOString();

  const [startStationId, destinationStationId] =
    getStartAndDestinationStationIds(linesStations);

  const game = {
    userId,
    startStationId,
    destinationStationId,
    startedAt,
  };

  try {
    const newGame = await startNewGame(game);
    res.status(201).json({
      game_id: newGame.id,
      started_at: startedAt,
      start_station_id: startStationId,
      destination_station_id: destinationStationId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const BASE_SCORE = 20;
app.post(
  "/api/games/:gameId/validate",
  isLoggedIn,
  [
    param("gameId").isInt({ min: 1 }).withMessage("Invalid game id").toInt(),

    body("segments")
      .isArray({ min: 1 })
      .withMessage("Segments must be a non-empty array"),

    body("segments.*.from")
      .isInt({ min: 1 })
      .withMessage("Each from value must be a valid station id")
      .toInt(),

    body("segments.*.to")
      .isInt({ min: 1 })
      .withMessage("Each to value must be a valid station id")
      .toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Invalid request",
          fields: errors.array(),
        });
      }

      const gameId = req.params.gameId;
      const segments = req.body.segments;
      const completedAt = dayjs().toISOString();

      const game = await getGameById(gameId);

      if (!game) {
        return res.status(404).json({
          error: "Game not found",
        });
      }

      if (Number(game.user_id) !== Number(req.user.id)) {
        return res.status(403).json({
          error: "Forbidden",
        });
      }

      // TODO: Validate route

      const isRouteValid = true;

      if (isRouteValid) {
      }
      const events = await drawEventsFromSegments(segments);
      const finalScore = Math.max(
        events.reduce((acc, currentEvent) => {
          return (acc += currentEvent.drawnEvent.points_worth);
        }, BASE_SCORE),
        0,
      );

      await completeGame(gameId, finalScore, completedAt);

      res.status(200).json({ isRouteValid, events, finalScore });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

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
