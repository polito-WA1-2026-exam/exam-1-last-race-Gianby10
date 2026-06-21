import db from "./db.js";

export const getStations = () => {
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

export const getLines = () => {
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

export const getLinesStations = () => {
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

export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id,name,description, points_worth FROM events`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

export const getLeaderboard = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(score) as score, users.name AS user_name, users.id AS user_id FROM games JOIN users ON user_id = users.id WHERE score IS NOT NULL AND completed_at IS NOT NULL GROUP BY user_id ORDER BY score DESC`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

export const getGameById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM games WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
};
// Create game
export const startNewGame = (newGame) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO games(user_id, start_station_id, destination_station_id,started_at) VALUES (?,?,?,?) RETURNING *`;
    db.get(
      query,
      [
        newGame.userId,
        newGame.startStationId,
        newGame.destinationStationId,
        newGame.startedAt,
      ],
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      },
    );
  });
};

export function completeGame(gameId, score, completedAt) {
  return new Promise((resolve, reject) => {
    const sql = ` UPDATE games SET score = ?, completed_at = ? WHERE id = ? `;
    db.run(sql, [score, completedAt, gameId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
}
