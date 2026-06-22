import db from "./db.js";

export const getStations = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name FROM stations`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getLines = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name FROM lines`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getLinesStations = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT line_id, station_id, stop_order FROM line_station ORDER BY line_id, stop_order`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id,name,description, points_worth FROM events`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getLeaderboard = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(score) as score, users.name AS user_name, users.id AS user_id FROM games JOIN users ON user_id = users.id WHERE score IS NOT NULL AND completed_at IS NOT NULL GROUP BY user_id, users.name ORDER BY score DESC, users.name ASC`;
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getGameById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, user_id, start_station_id, destination_station_id, started_at, completed_at, score FROM games WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
// Create game
export const startNewGame = (newGame) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO games(user_id, start_station_id, destination_station_id,started_at) VALUES (?,?,?,?) RETURNING id,
        user_id,
        start_station_id,
        destination_station_id,
        started_at`;
    db.get(
      query,
      [
        newGame.userId,
        newGame.startStationId,
        newGame.destinationStationId,
        newGame.startedAt,
      ],
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

export function completeGame(gameId, score, completedAt) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE games SET score = ?, completed_at = ? WHERE id = ? AND completed_at IS NULL`;
    db.run(sql, [score, completedAt, gameId], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve();
      }
    });
  });
}
