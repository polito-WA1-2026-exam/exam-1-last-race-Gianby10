DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS lines;
DROP TABLE IF EXISTS line_station;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS games;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pw_hash TEXT NOT NULL,
  pw_salt TEXT NOT NULL
);

CREATE TABLE stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE line_station (
  line_id INTEGER REFERENCES lines(id),
  station_id INTEGER REFERENCES stations(id),
  stop_order INTEGER NOT NULL CHECK(stop_order > 0), -- order non va perche sql è scemo

  PRIMARY KEY(line_id,station_id)
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points_worth INTEGER NOT NULL CHECK(points_worth BETWEEN -4 AND 4)
);

CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  start_station_id INTEGER NOT NULL REFERENCES stations(id),
  destination_station_id INTEGER NOT NULL REFERENCES stations(id),
  score INTEGER NOT NULL CHECK(score >= 0),
  played_at TEXT NOT NULL
);