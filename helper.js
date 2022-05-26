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
 * @returns {promise} promises a single-element array of the user, or an empty array if not found.
 */
export const findUserFromUsername = async (username) => {
  const dbQuery = 'SELECT * FROM users WHERE username = $1';
  const user = await pool.query(dbQuery, [username]);
  return user.rows;
};

/**
 * Finds user from the users table where users.email is the email
 * @param {string} email the email to search
 * @returns {promise} promises a single-element array of the user, or an empty array if not found.
 */
export const findUserFromEmail = async (email) => {
  const dbQuery = 'SELECT * FROM users WHERE email = $1';
  const user = await pool.query(dbQuery, [email]);
  return user.rows;
};

/**
 * Finds user from the users table where users.id is the id
 * @param {number} id the id to search
 * @returns {promise} Promises a single-element array of the user, or an empty array if not found.
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
 * @returns {Promise} returns a promise obj
 */
export const createNewUser = async (username, email, passwordHash) => {
  const dbQuery = 'INSERT INTO users (username, email, password, profile_url) VALUES ($1, $2, $3, $4)';
  await pool.query(dbQuery, [username, email, passwordHash, 'profile.svg']);
};

/**
 * Updates the values of the user telephone and twitter
 * @param user{number} id user's id
 * @param {string} telephone the phone_num to be updated to the db
 * @param {string} twitter the twitter handle to be updated to the db
 * @returns {Promise} returns a promise obj
 */
export const updateUser = async (id, telephone, twitter) => {
  const dbQuery = 'UPDATE users SET phone_num=$1, twitter_handle=$2 WHERE id=$3';
  await pool.query(dbQuery, [telephone, twitter, id]);
};

/* USER_CYCLE QUERIES */

/**
 * Creates an entry for the user_cycle table
 * @param {number} userID ID of the user to be put in the cycle
 * @param {number} cycleID ID of the cycle to have the users
 */
export const createUserCycle = async (userID, cycleID) => {
  const dbQuery = 'INSERT INTO user_cycle (user_id, cycle_id) VALUES ($1, $2)';
  await pool.query(dbQuery, [userID, cycleID]);
};

/**
 * Find user_cycle from the user_cycle table where
 * user_cycle.user_id = userID and
 * user_cycle.cycle_id = cycleID
 * @param {number} userID the userID to search
 * @param {number} cycleID the cycleID to search
 * @returns {promise} promises a single element array for the user_cycle, or an empty array if not found
 */
export const findUserCycleFromUserAndCycle = async (userID, cycleID) => {
  const dbQuery = 'SELECT * FROM user_cycle WHERE user_id = $1 AND cycle_id = $2';
  const userCycle = await pool.query(dbQuery, [userID, cycleID]);
  return userCycle.rows;
};

/**
 * Find user_cycle from the user_cycle table where
 * cycle.id = cycleID
 * @param {number} cycleID the cycle ID to search
 * @returns {promise} promises an array of user_cycle data, or an empty array if not found
 */
export const findUserCycleFromCycle = async (cycleID) => {
  const dbQuery = 'SELECT * FROM user_cycle WHERE cycle_id = $1';
  const userCycle = await pool.query(dbQuery, [cycleID]);
  return userCycle.rows;
};

/* CYCLE TABLE QUERIES */

/**
 * Finds all cycles that the user hosts
 * @param {number} hostID ID of the host of the cycle
 * @returns {promise} Promises an array of the cycles hosted, or an empty array if not found.
 */
export const findUpcomingHostedCycles = async (hostID) => {
  const dbQuery = 'SELECT * FROM cycle WHERE host_id = $1 AND has_started = $2';
  const hostedCycles = await pool.query(dbQuery, [hostID, false]);
  return hostedCycles.rows;
};

/**
 * Finds ongoing cycles that the user hosts
 * @param {number} hostID ID of the host of the cycle
 * @returns {promise} Promises an array of the cycles hosted, or an empty array is not found.
 */
export const findOngoingHostedCycles = async (hostID) => {
  const dbQuery = 'SELECT * FROM cycle WHERE host_id = $1 AND has_started = $2 AND has_ended = $3';
  const hostedCycles = await pool.query(dbQuery, [hostID, true, false]);
  return hostedCycles.rows;
};

/**
 * finds a particular cycle from their ID
 * @param {number} cycleID ID value of the cycle
 * @returns {promise} Promises a single array of the cycle, or an empty array if not found
 */
export const findCycleFromID = async (cycleID) => {
  const dbQuery = 'SELECT * FROM cycle WHERE id = $1';
  const cycle = await pool.query(dbQuery, [cycleID]);
  return cycle.rows;
};

/* INVITE TABLE QUERIES */

/**
 * Find invite from the invites table where
 * invite.cycle_id = cycleID and
 * invite.invitee_id = inviteeID
 * @param {number} inviteeID the userID to search
 * @param {number} cycleID the cycleID to search
 * @returns {promise} promises a single element array for the user_cycle, or an empty array if not found
 */
export const findInviteFromCycleIDAndInviteeID = async (inviteeID, cycleID) => {
  const dbQuery = 'SELECT * FROM invites WHERE cycle_id = $1 AND invitee_id = $2';
  const invite = await pool.query(dbQuery, [cycleID, inviteeID]);
  return invite.rows;
};

/**
 * Find invite from the invites table where
 * invite.id = inviteID
 * @param {number} inviteID the invite.id to search
 * @returns {promise} promises a single element array for the user_cycle, or an empty array if not found
 */
export const findInviteFromInviteId = async (inviteID) => {
  const dbQuery = 'SELECT * FROM invites WHERE id = $1';
  const invite = await pool.query(dbQuery, [inviteID]);
  return invite.rows;
};

/**
 * Create a new entry in the invites table
 * @param {number} inviteeID invitee ID to be added
 * @param {number} cycleID cycle ID to be added
 */
export const createInvite = async (inviteeID, cycleID) => {
  const dbQuery = 'INSERT INTO invites (cycle_id, invitee_id) VALUES ($1, $2)';
  await pool.query(dbQuery, [cycleID, inviteeID]);
};

/**
 * Deletes an entry in the invites table
 * @param {number} inviteID invite ID to be deleted
 */
export const deleteInvite = async (inviteID) => {
  const dbQuery = 'DELETE FROM invites WHERE id = $1';
  await pool.query(dbQuery, [inviteID]);
};

/* SESSIONS TABLE QUERIES */

/**
 * find all sessions from a cycle ID
 * @param {number} cycleID the ID of the cycle to find sessions from
 * @returns {promise} An array with all the sessions from a cycle
 */
export const findSessionsFromCycle = async (cycleID) => {
  const dbQuery = 'SELECT * FROM sessions WHERE cycle_id = $1 ORDER BY created_at';
  const sessionsArr = await pool.query(dbQuery, [cycleID]);
  return sessionsArr.rows;
};

export const updateSessionWinner = async (sessionWinner, sessionID) => {
  const dbQuery = 'UPDATE sessions SET session_u_c_winner = $1 WHERE id = $2';
  await pool.query(dbQuery, [sessionWinner, sessionID]);
};

export const updateAllPaymentStatus = async (sessionID) => {
  const dbQuery = 'UPDATE sessions SET all_payments_received = true WHERE id = $1';
  await pool.query(dbQuery, [sessionID]);
};

/* PAYMENT TABLE QUERIES */

/**
 * updates payment status to true in payment ID
 * @param {number} paymentID
 */
export const updatePaymentStatus = async (paymentID) => {
  const dbQuery = 'UPDATE payments SET has_paid = true WHERE id = $1';
  await pool.query(dbQuery, [paymentID]);
};
/* MULTIPLE TABLE QUERIES */

/**
 * Creates a new cycle with these params, also added the host to user_cycle
 * db queried cycles, user_cycle
 * @param {string} cycleName the name of the cycle to be added
 * @param {number} hostID the id of the host of the cycle
 * @param {string} sessionFrequency the frequency in which payments are made (in psql interval format)
 * @param {number} sessionPayment the amount pledged per session
 */
export const createCycle = async (cycleName, hostID, sessionFrequency, sessionPayment) => {
  const dbQuery = 'INSERT INTO cycle (cycle_name, host_id, session_freq, session_payment, has_started, has_ended) VALUES($1, $2, $3, $4, $5, $6) RETURNING id';
  const returnedValue = await pool.query(dbQuery, [cycleName, hostID, sessionFrequency, sessionPayment, false, false]);
  const { id } = returnedValue.rows[0];
  await createUserCycle(hostID, id);
};

/**
 * Cancels a cycle, deletes entry on cycle, invites and user_cycle
 * db queried cycle, invites, user_cycle
 * @param {number} cycleID the ID of the cycle to be deleted
 */
export const cancelCycle = async (cycleID) => {
  const dbQueryOne = 'DELETE FROM cycle WHERE id = $1';
  const dbQueryTwo = 'DELETE FROM invites WHERE cycle_id = $1';
  const dbQueryThree = 'DELETE FROM user_cycle WHERE cycle_id = $1';
  await pool.query(dbQueryOne, [cycleID]);
  await pool.query(dbQueryTwo, [cycleID]);
  await pool.query(dbQueryThree, [cycleID]);
};

/**
 * Fetch all the relevant info for formatting the notifications
 * db queried invites, cycle, users
 * @param {number} inviteeID the ID of the person to be invited
 * @returns {promise} A promise of an array of information necessary for formatting the notifications tab
 */
export const fetchInvites = async (inviteeID) => {
  const dbQuery = 'SELECT invites.id AS inviteID, cycle.id AS cycleId, cycle.session_freq AS cycleFreq, cycle.session_payment AS sessionPayment, cycle.cycle_name AS cycleName, users.username AS inviterName FROM INVITES INNER JOIN cycle ON cycle.id = invites.cycle_id INNER JOIN users ON cycle.host_id = users.id WHERE invites.invitee_ID = $1';
  const invitesInfo = await pool.query(dbQuery, [inviteeID]);
  return invitesInfo.rows;
};

/**
 * finds Joined user ID where user is not host and has not started
 * db queried cycle, users, user_cycle
 * @param {number} userID user ID to search cycles
 */
export const findJoinedUpcomingCyclesNotHost = async (userID) => {
  const dbQuery = 'SELECT cycle.id AS cycle_id, cycle.session_freq AS cycle_session_freq, cycle.session_payment AS cycle_session_payment, cycle.cycle_name AS cycle_name, users.username AS host_name FROM user_cycle INNER JOIN cycle ON user_cycle.cycle_id = cycle.id INNER JOIN users ON users.id = cycle.host_id WHERE user_cycle.user_id = $1 AND cycle.host_id != $1 AND cycle.has_started = false';
  const cycles = await pool.query(dbQuery, [userID]);
  return cycles.rows;
};

/**
 * finds Joined user ID where user is not host and is currently ongoing
 * db queried cycle, users, user_cycle
 * @param {number} userID user ID to search cycles
 */
export const findJoinedOngoingCyclesNotHost = async (userID) => {
  const dbQuery = 'SELECT cycle.id AS cycle_id, cycle.session_freq AS cycle_session_freq, cycle.session_payment AS cycle_session_payment, cycle.cycle_name AS cycle_name, users.username AS host_name FROM user_cycle INNER JOIN cycle ON user_cycle.cycle_id = cycle.id INNER JOIN users ON users.id = cycle.host_id WHERE user_cycle.user_id = $1 AND cycle.host_id != $1 AND cycle.has_started = true AND cycle.has_ended = false';
  const cycles = await pool.query(dbQuery, [userID]);
  return cycles.rows;
};

/**
 * finds Joined user ID where user is not host and is completed
 * db queried cycle, users, user_cycle
 * @param {number} userID user ID to search cycles
 */
export const findJoinedCompletedCyclesNotHost = async (userID) => {
  const dbQuery = 'SELECT cycle.id AS cycle_id, cycle.session_freq AS cycle_session_freq, cycle.session_payment AS cycle_session_payment, cycle.cycle_name AS cycle_name, users.username AS host_name FROM user_cycle INNER JOIN cycle ON user_cycle.cycle_id = cycle.id INNER JOIN users ON users.id = cycle.host_id WHERE user_cycle.user_id = $1 AND cycle.host_id != $1 AND cycle.has_ended = true';
  const cycles = await pool.query(dbQuery, [userID]);
  return cycles.rows;
};

/**
 * starts a cycle, creates all the appropriate db
 * db queried cycle, user_cycle, sessions, payment
 * @param {number} cycleID the id of the cycle to start
 */
export const startCycleFromID = async (cycleID) => {
  // updates cycle and start date from the cycle table
  const dbQueryInitial = 'UPDATE cycle SET has_started = true, start_date = CURRENT_DATE WHERE id = $1';
  await pool.query(dbQueryInitial, [cycleID]);

  // creates entries in session table equivalent to the length of userCycleData
  // auto populate the duedate with currentDate + freq for the first one, or the previous duedate + freq
  let sessionId;
  const userCycleArr = await findUserCycleFromCycle(cycleID);
  for (let i = 0; i < userCycleArr.length; i += 1) {
    if (!sessionId) {
      const dbSessionQuery = 'INSERT INTO sessions (cycle_ID, due_date, all_payments_received) VALUES ($1, (CURRENT_DATE + (SELECT session_freq FROM cycle WHERE id = $1)), $2) RETURNING id';
      const idArr = await pool.query(dbSessionQuery, [cycleID, false]);
      sessionId = idArr.rows[0].id;
    } else {
      const dbSessionQuery = 'INSERT INTO sessions (cycle_id, due_date,all_payments_received) VALUES ($1, ((SELECT due_date FROM sessions WHERE ID = $2) + (SELECT session_freq FROM cycle WHERE id = $1)), $3) RETURNING id';
      const idArr = await pool.query(dbSessionQuery, [cycleID, sessionId, false]);
      sessionId = idArr.rows[0].id;
    }
  }

  // creates all payment sessions
  const dbQueryGetSession = 'SELECT * FROM sessions WHERE cycle_id = $1';
  const sessionsArr = await pool.query(dbQueryGetSession, [cycleID]);
  sessionsArr.rows.forEach(async (session) => {
    const { id: sessionID } = session;
    userCycleArr.forEach(async (userCycle) => {
      const { id: userCycleID } = userCycle;
      const dbQuery = 'INSERT INTO payments (u_c_id, session_id, has_paid) VALUES ($1,$2,$3)';
      await pool.query(dbQuery, [userCycleID, sessionID, false]);
    });
  });
};

/**
 * finds the username of all entries in user_cycle, with joins
 * @param {number} cycleID the id of the cycle to find users
 */
export const findUsernameFromCycle = async (cycleID) => {
  const dbQuery = 'SELECT users.id, users.username, users.profile_url FROM user_cycle INNER JOIN users ON user_cycle.user_id = users.id WHERE user_cycle.cycle_id = $1';
  const userProfile = await pool.query(dbQuery, [cycleID]);
  return userProfile.rows;
};

/**
 * find usernames from Session ID, for formatting and forms
 * @param {number} sessionID session ID to search
 * @returns {promise} an array of user profile and whether or not they have paid
 */
export const findProfileAndPaymentsFromSessionID = async (sessionID) => {
  const dbQuery = 'SELECT payments.id, payments.has_paid, users.username, users.profile_url FROM users INNER JOIN user_cycle ON users.id = user_cycle.user_id INNER JOIN payments ON payments.u_c_id = user_cycle.id WHERE session_id = $1 ORDER BY payments.id';
  const paymentsArr = await pool.query(dbQuery, [sessionID]);
  return paymentsArr.rows;
};
