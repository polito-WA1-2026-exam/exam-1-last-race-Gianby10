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
  getEvents,
  getGameById,
  getLeaderboard,
  getLines,
  getLinesStations,
  getStations,
  startNewGame,
} from "./games-dao.js";
import { BASE_SCORE, PLANNING_TIME } from "./constants.js";
import { login } from "./users-dao.js";
import {
  createSegments,
  drawEventsFromSegments,
  getStartAndDestinationStationIds,
  groupStationsByLine,
  validateRoute,
} from "./utils.js";

const app = express();
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
      return res.status(401).json({ error: info ?? "Invalid credentials" });
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
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    return res.status(204).end();
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
  try {
    const linesStationsRows = await getLinesStations();
    const linesStations = groupStationsByLine(linesStationsRows);
    const segments = createSegments(linesStations);
    res.status(200).json(segments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/games/start", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    const linesStationsRows = await getLinesStations();
    const linesStations = groupStationsByLine(linesStationsRows);

    const startedAt = dayjs().toISOString();

    const [startStationId, destinationStationId] =
      getStartAndDestinationStationIds(linesStations);
    // const [startStationId, destinationStationId] = [10, 4];

    const game = {
      userId,
      startStationId,
      destinationStationId,
      startedAt,
    };
    const newGame = await startNewGame(game);
    res.status(201).json({
      gameId: newGame.id,
      startedAt: startedAt,
      startStationId: startStationId,
      destinationStationId: destinationStationId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post(
  "/api/games/:gameId/validate",
  isLoggedIn,
  [
    param("gameId").isInt({ min: 1 }).withMessage("Invalid game id").toInt(),

    body("segments").isArray().withMessage("Segments must be an array"),

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

      if (game.completed_at) {
        return res.status(409).json({
          error: "Game already completed",
        });
      }

      const gameDuration = dayjs().diff(dayjs(game.started_at), "second");

      // adding 2 seconds to account for network delays
      if (gameDuration > PLANNING_TIME + 2) {
        const finalScore = 0;

        await completeGame(gameId, finalScore, completedAt);

        return res.status(200).json({
          isRouteValid: false,
          events: [],
          finalScore,
        });
      }

      const linesStationsRows = await getLinesStations();
      const linesStations = groupStationsByLine(linesStationsRows);
      const isRouteValid = validateRoute(
        segments,
        linesStations,
        game.start_station_id,
        game.destination_station_id,
      );

      if (isRouteValid) {
        const allEvents = await getEvents();
        const drawnEvents = await drawEventsFromSegments(allEvents, segments);

        let currentScore = BASE_SCORE;

        const events = drawnEvents.map((event) => {
          currentScore += Number(event.drawnEvent.points_worth);

          return {
            segment: event.segment,
            drawnEvent: {
              id: event.drawnEvent.id,
              name: event.drawnEvent.name,
              description: event.drawnEvent.description,
              pointsWorth: event.drawnEvent.points_worth,
            },

            scoreAfterEvent: Math.max(0, currentScore),
          };
        });

        const finalScore = Math.max(0, currentScore);
        await completeGame(gameId, finalScore, completedAt);
        res.status(200).json({ isRouteValid, events, finalScore });
      } else {
        const finalScore = 0;
        await completeGame(gameId, finalScore, completedAt);
        res.status(200).json({ isRouteValid, events: [], finalScore });
      }
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
