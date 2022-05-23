import pg from 'pg';

const pgConnectionConfigs = {
  user: 'sho',
  host: 'localhost',
  database: 'bagelfunds',
  port: 5432, // Postgres server always runs on this port
};
const pool = new pg.Pool(pgConnectionConfigs);

/**
 * Finds user from the users table where users.username is username
 * @param {string} username the username to search
 * @returns {Array} A single-element array of the user, or an empty array if not found.
 */
export const findUserFromUsername = async (username) => {
  const dbQuery = 'SELECT * FROM users WHERE username = $1';
  const user = await pool.query(dbQuery, [username]);
  return user.rows;
};

/**
 * Finds user from the users table where users.email is the email
 * @param {string} email the email to search
 * @returns {Array} A single-element array of the user, or an empty array if not found.
 */
export const findUserFromEmail = async (email) => {
  const dbQuery = 'SELECT * FROM users WHERE email = $1';
  const user = await pool.query(dbQuery, [email]);
  return user.rows;
};

export const createNewUser = async (username, email, passwordHash) => {
  const dbQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
  await pool.query(dbQuery, [username, email, passwordHash]);
};
