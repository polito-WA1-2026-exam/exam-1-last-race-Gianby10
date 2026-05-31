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

const users = [
  {
    email: "mario@gmail.com",
    name: "Mario rossi",
    password: "password123",
  },
  {
    email: "giovanni@gmail.com",
    name: "Giovanni Verdi",
    password: "password123",
  },
  {
    email: "luca@gmail.com",
    name: "Luca bruno",
    password: "password123",
  },
  {
    email: "gb@gmail.com",
    name: "Gianbattista Vivolo",
    password: "password123",
  },
];

const seed = () => {
  users.forEach(async (u) => {
    await insertUser(u.email, u.name, u.password);
  });
};

seed();
