import db from "./db.js";
import crypto from "crypto";

export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(false);
      } else {
        const user = { id: row.id, email: row.email, name: row.name };

        crypto.scrypt(password, row.pw_salt, 32, (err, hashedPw) => {
          if (err) {
            reject(err);
          }
          if (
            !crypto.timingSafeEqual(Buffer.from(row.pw_hash, "hex"), hashedPw) // prevents timing attacks, if password is correct or not, the time used to compare it is the same
          ) {
            resolve(false);
          } else {
            resolve(user);
          }
        });
      }
    });
  });
};
