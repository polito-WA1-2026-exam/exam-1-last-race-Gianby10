"use strict";

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    throw err;
  }
  console.log("Successfully connected to DB");
});

export default db;
