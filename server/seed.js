"use strict";
import sqlite3 from "sqlite3";
import crypto from "crypto";

const db = new sqlite3.Database("db.sqlite");

const insertUser = (email, name, password) => {
  return new Promise((resolve, reject) => {
    const pwsalt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(password, pwsalt, 32, (err, hashedPassword) => {
      if (err) {
        reject(err);
      }

      const pwhash = hashedPassword.toString("hex");

      db.get(
        "INSERT INTO users (email, name, pw_hash, pw_salt) VALUES (?, ?, ?, ?) RETURNING *",
        [email, name, pwhash, pwsalt],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      );
    });
  });
};

const insertEvent = (name, description, pointsWorth) => {
  return new Promise((resolve, reject) => {
    db.get(
      "INSERT INTO events (name, description, points_worth) VALUES (?, ?, ?) RETURNING *",
      [name, description, pointsWorth],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      },
    );
  });
};

const insertStation = (id, name) => {
  return new Promise((resolve, reject) => {
    db.get(
      "INSERT INTO stations (id, name) VALUES (?, ?) RETURNING *",
      [id, name],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      },
    );
  });
};

const insertLine = (id, name) => {
  return new Promise((resolve, reject) => {
    db.get(
      "INSERT INTO lines (id, name) VALUES (?, ?) RETURNING *",
      [id, name],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      },
    );
  });
};

const insertLinesStations = (lineId, stationIds) => {
  stationIds.forEach((station_id, i) => {
    return new Promise((resolve, reject) => {
      db.get(
        "INSERT INTO line_station (line_id, station_id,stop_order) VALUES (?, ?, ?) RETURNING *",
        [lineId, station_id, i + 1],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      );
    });
  });
};

const users = [
  {
    email: "mario@gmail.com",
    name: "Mario Rossi",
    password: "password123",
  },
  {
    email: "giovanni@gmail.com",
    name: "Giovanni Verdi",
    password: "password123",
  },
  {
    email: "luca@gmail.com",
    name: "Luca Bruno",
    password: "password123",
  },
  {
    email: "gb@gmail.com",
    name: "Gianbattista Vivolo",
    password: "password123",
  },
];

const events = [
  {
    name: "Quiet journey",
    description: "Usual journey, nothing happens",
    pointsWorth: 0,
  },
  {
    name: "Wrong platform",
    description:
      "You go to the wrong platform and lose time finding the correct platform",
    pointsWorth: -2,
  },
  {
    name: "Kind passenger",
    description: "A kind passenger helps you find a better connection",
    pointsWorth: 1,
  },
  {
    name: "Line delay",
    description:
      "The line is delayed (as always) and you take longer to get to your destination",
    pointsWorth: -3,
  },
  {
    name: "Lucky ticket",
    description: "You find a special ticket discount and gain extra coins",
    pointsWorth: 2,
  },
  {
    name: "Crowded train",
    description: "The train is very crowded and you need to stay standing",
    pointsWorth: -1,
  },
  {
    name: "Fast connection",
    description:
      "You catch the next train just in time thanks to a perfect connection",
    pointsWorth: 3,
  },
  {
    name: "Lost ticket",
    description: "You lose your ticket and have to pay a fine",
    pointsWorth: -4,
  },
  {
    name: "Seat promotion",
    description: "You get promoted to a first class seat",
    pointsWorth: 2,
  },
  {
    name: "Out of service bathroom",
    description:
      "The bathroom is not working and you need to wait to do your things",
    pointsWorth: -1,
  },
  {
    name: "Express ride",
    description: "An express train helps you move faster than expected",
    pointsWorth: 4,
  },
  {
    name: "Service interruption",
    description: "A temporary line interruption forces you to wait",
    pointsWorth: -4,
  },
];

const stations = [
  { id: 1, name: "Porta del Sale" },
  { id: 2, name: "Molo delle Sirene" },
  { id: 3, name: "Piazza dei Venti" },
  { id: 4, name: "Borgo delle Onde" },
  { id: 5, name: "Torre del Faro" },
  { id: 6, name: "Mercato Blu" },
  { id: 7, name: "Giardini di Corallo" },
  { id: 8, name: "Arco di Levante" },
  { id: 9, name: "Riva Antica" },
  { id: 10, name: "Collina degli Ulivi" },
  { id: 11, name: "Fontana del Tempo" },
  { id: 12, name: "Corte delle Lanterne" },
  { id: 13, name: "Via del Tramonto" },
  { id: 14, name: "Darsena Nuova" },
];

const lines = [
  { id: 1, name: "Libeccio Line" },
  { id: 2, name: "Scirocco Line" },
  { id: 3, name: "Maestrale Line" },
  { id: 4, name: "Levante Line" },
  { id: 5, name: "Ponente Line" },
];

const lineStations = [
  { lineId: 1, stationIds: [1, 11, 6, 9, 7] },
  { lineId: 2, stationIds: [8, 14, 3, 6, 2] },
  { lineId: 3, stationIds: [5, 12, 10, 14] },
  { lineId: 4, stationIds: [4, 11, 3, 13] },
  { lineId: 5, stationIds: [10, 9, 3, 2] },
];

/*
Libeccio Line:
Porta del Sale -> Fontana del Tempo -> Mercato Blu -> Riva Antica -> Giardini di Corallo

Scirocco Line:
Arco di Levante -> Darsena Nuova -> Piazza dei Venti -> Mercato Blu -> Molo delle Sirene

Maestrale Line:
Torre del Faro -> Corte delle Lanterne -> Collina degli Ulivi -> Darsena Nuova

Levante Line:
Borgo delle Onde -> Fontana del Tempo -> Piazza dei Venti -> Via del Tramonto

Ponente Line:
Collina degli Ulivi -> Riva Antica -> Piazza dei Venti -> Molo delle Sirene
*/

const seed = () => {
  users.forEach(async (u) => {
    await insertUser(u.email, u.name, u.password);
  });
  events.forEach(async (e) => {
    await insertEvent(e.name, e.description, e.pointsWorth);
  });

  stations.forEach(async (s) => {
    await insertStation(s.id, s.name);
  });
  lines.forEach(async (l) => {
    await insertLine(l.id, l.name);
  });
  lineStations.forEach(async (ls) => {
    await insertLinesStations(ls.lineId, ls.stationIds);
  });
};

seed();
