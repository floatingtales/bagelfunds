import pg from 'pg';

const pgConnectionConfigs = {
  user: 'sho',
  host: 'localhost',
  database: 'bagelfunds',
  port: 5432, // Postgres server always runs on this port
};
const pool = new pg.Pool(pgConnectionConfigs);

/** USER TABLE QUERIES */

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

/**
 * Finds user from the users table where users.id is the id
 * @param {number} id the id to search
 * @returns {Array} A single-element array of the user, or an empty array if not found.
 */
export const findUserFromID = async (id) => {
  const dbQuery = 'SELECT * FROM users WHERE id = $1';
  const user = await pool.query(dbQuery, [id]);
  return user.rows;
};

/**
 * Creates a new db entry for user
 * @param {string} username the username to add to db
 * @param {string} email the email to add to db
 * @param {string} passwordHash the hashed password to add to db
 */
export const createNewUser = async (username, email, passwordHash) => {
  const dbQuery = 'INSERT INTO users (username, email, password, profile_url) VALUES ($1, $2, $3, $4)';
  await pool.query(dbQuery, [username, email, passwordHash, 'profile.svg']);
};

export const updateUser = async (id, telephone, twitter) => {
  const dbQuery = 'UPDATE users SET phone_num=$1, twitter_handle=$2 WHERE id=$3';
  await pool.query(dbQuery, [telephone, twitter, id]);
};
