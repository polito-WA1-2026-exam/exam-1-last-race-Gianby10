import db from "./db.js";

export const getAllStations = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name FROM stations`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

export const getAllLines = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name FROM lines`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

export const getAllLinks = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT line_id, station_id, stop_order FROM line_station`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};
