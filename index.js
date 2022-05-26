import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import favicon from 'serve-favicon';
import path from 'path';
import moment from 'moment';
import {
  cancelCycle,
  createCycle,
  createInvite,
  createNewUser,
  createUserCycle,
  deleteInvite,
  fetchInvites,
  findCycleFromID,
  findInviteFromCycleIDAndInviteeID,
  findInviteFromInviteId,
  findJoinedOngoingCyclesNotHost,
  findJoinedUpcomingCyclesNotHost,
  findOngoingHostedCycles,
  findProfileAndPaymentsFromSessionID,
  findSessionsFromCycle,
  findUpcomingHostedCycles,
  findUserCycleFromCycle,
  findUserCycleFromUserAndCycle,
  findUserFromEmail,
  findUserFromID,
  findUserFromUsername,
  findUsernameFromCycle,
  startCycleFromID,
  updateAllPaymentStatus,
  updatePaymentStatus,
  updateSessionWinner,
  updateUser,
} from './helper.js';

/** set up express and ejs */
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(favicon(path.join('public', 'favicon-white.ico')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

/** Handler Functions */

/** Middlewares */

/**
 * Checks whether user logged in or not, will redirect to home with error if not
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const loginChecker = (req, res, next) => {
  console.log('middleware - login checker:', req.url);
  if (!req.cookies.loggedUser) {
    res.redirect('/?e=not-logged-in');
    return;
  }
  next();
};

/**
 * Checks whether the logged user is in the cycle or not,
 * will redirect to home with error if not
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 * @returns
 */
const inCycleChecker = async (req, res, next) => {
  console.log('middleware - in cycle checker:', req.url);
  const { cycleID } = req.params;
  const { loggedUser } = req.cookies;
  const userCycleExists = await findUserCycleFromUserAndCycle(loggedUser, cycleID);

  // user not in cycle
  if (userCycleExists.length === 0) {
    res.redirect('/?e=not-in-cycle');
    return;
  }
  next();
};

/** Get handlers */

/**
 * get landing page if not logged in / user dashboard if logged in
 * @param {object} req request
 * @param {object} res response
 */
const landingPageHandler = async (req, res) => {
  console.log('get:', req.url);
  const err = (!req.query.e) ? '' : req.query.e;
  const success = (!req.query.s) ? '' : req.query.s;

  if (!req.cookies.loggedUser) {
    res.render('landing', { err, success });
    return;
  }

  const userDetailsArr = await findUserFromID(req.cookies.loggedUser);
  const userDetails = userDetailsArr[0];

  const upcomingHostedCycles = await findUpcomingHostedCycles(userDetails.id);
  const ongoingHostedCycles = await findOngoingHostedCycles(userDetails.id);
  const upcomingJoinedCycles = await findJoinedUpcomingCyclesNotHost(userDetails.id);
  const ongoingJoinedCycles = await findJoinedOngoingCyclesNotHost(userDetails.id);

  res.render(
    'userDashboard',
    {
      err,
      success,
      userDetails,
      upcomingHostedCycles,
      ongoingHostedCycles,
      upcomingJoinedCycles,
      ongoingJoinedCycles,
    },
  );
};

/**
 * get login page
 * @param {object} req request
 * @param {object} res response
 */
const loginPageHandler = (req, res) => {
  console.log('get:', req.url);
  const err = (!req.query.e) ? '' : req.query.e;
  res.render('login', { err });
};

/**
 * get logout handler, deletes login cookie
 * @param {object} req request
 * @param {object} res response
 */
const logoutHandler = (req, res) => {
  console.log('get:', req.url);
  res.clearCookie('loggedUser');
  res.redirect('/');
};

/**
 * get profile handler, shows profile
 * @param {object} req request
 * @param {object} res response
 */
const profileHandler = async (req, res) => {
  console.log('get:', req.url);

  const userDetailsArr = await findUserFromID(req.cookies.loggedUser);
  const userDetails = userDetailsArr[0];
  res.render('profile', { userDetails });
};

/**
 * get cycle handler, shows form to make cycles
 * @param {object} req request
 * @param {object} res response
 */
const cycleHandler = async (req, res) => {
  console.log('get:', req.url);
  res.render('create', { moment });
};

/**
 * get notifications handler, shows all notifications
 * @param {object} req request
 * @param {object} res response
 */
const notificationHandler = async (req, res) => {
  console.log('get:', req.url);
  const success = (!req.query.s) ? '' : req.query.s;

  const inviteInfo = await fetchInvites(req.cookies.loggedUser);
  // take all data from notifications and send them all to the frontend
  res.render('notifications', { inviteInfo, success });
};

/**
 * get overview handler, shows details of cycle and who are in the cycle
 * Hosts get special command buttons
 * @param {object} req request
 * @param {object} res response
 */
const overviewHandler = async (req, res) => {
  console.log('get:', req.url);

  const err = (!req.query.e) ? '' : req.query.e;
  const success = (!req.query.s) ? '' : req.query.s;
  const { cycleID } = req.params;
  const { loggedUser } = req.cookies;

  const cycleArr = await findCycleFromID(cycleID);
  const cycle = cycleArr[0];

  const hostArr = await findUserFromID(cycle.host_id);
  const host = hostArr[0];

  const isHost = Number(loggedUser) === host.id;

  const joinedUserProfiles = await findUsernameFromCycle(cycleID);

  const sessionArr = await findSessionsFromCycle(cycleID);

  const paymentsObj = {};
  for (let i = 0; i < sessionArr.length; i += 1) {
    const paymentsArr = await findProfileAndPaymentsFromSessionID(sessionArr[i].id);
    paymentsObj[`${sessionArr[i].id}`] = paymentsArr;
  }

  res.render('overview', {
    err,
    success,
    cycle,
    host,
    isHost,
    joinedUserProfiles,
    sessionArr,
    paymentsObj,
  });
};

/** put handlers */

/**
 * Update user put handler, updates phone number and twitter
 * @param {object} req request
 * @param {object} res response
 * @returns {undefined}
 */
const editProfileHandler = async (req, res) => {
  console.log('put:', req.url);
  const { id } = req.params;
  const { phone, twitter } = req.body;
  if (id !== req.cookies.loggedUser) {
    // this shouldn't happen but for precaution
    // auto logouts the user
    res.redirect('/logout');
    return;
  }
  await updateUser(id, phone, twitter);
  res.redirect('/profile');
};

/**
 * Starts a cycle
 * @param {object} req request
 * @param {object} res response
 * @returns {undefined}
 */
const startCycleHandler = async (req, res) => {
  console.log('put:', req.url);
  const { cycleID } = req.params;
  const userCycle = await findUserCycleFromCycle(cycleID);

  // if there's only one user, you can't start a cycle
  if (userCycle.length < 2) {
    res.redirect('/?e=not-enough-user');
    return;
  }

  // starts the cycle - this is a huge O(n**2) complexity code
  await startCycleFromID(cycleID);

  res.redirect('/');
};

const verifyPayment = async (req, res) => {
  console.log('put:', req.url);
  const { cycleID, sessionID, paymentID } = req.params;
  const { loggedUser } = req.cookies;

  const cycleArr = await findCycleFromID(cycleID);
  const cycle = cycleArr[0];

  // if not the host triggered the button
  if (cycle.host_id !== Number(loggedUser)) {
    res.redirect(`/overview/${cycleID}?e=not-authorized`);
  }
  await updatePaymentStatus(paymentID);

  const allPayments = await findProfileAndPaymentsFromSessionID(sessionID);
  let hasUnpaid = false;

  for (let i = 0; i < allPayments.length; i += 1) {
    const payment = allPayments[i];
    if (!payment.has_paid) { hasUnpaid = true; break; }
  }

  // if all people has paid, update session id's all payments received
  if (!hasUnpaid) {
    await updateAllPaymentStatus(sessionID);
  }
  res.redirect(`/overview/${cycleID}?s=verified-payment`);
};

const randomizeWinner = async (req, res) => {
  console.log('put:', req.url);
  const { cycleID, sessionID } = req.params;
  const userCycleArr = await findUserCycleFromCycle(cycleID);
  const sessionsArr = await findSessionsFromCycle(cycleID);
  const userCycleIDArr = [];
  const userIDArr = [];

  // put copy of all user_cycle id in a cycle
  userCycleArr.forEach((userCycle) => {
    userCycleIDArr.push(userCycle.id);
    userIDArr.push(userCycle.user_id);
  });

  // delete matching user_cycle id
  sessionsArr.forEach((session) => {
    const indexOfWinner = userCycleIDArr.indexOf(session.session_u_c_winner);
    if (indexOfWinner !== -1) {
      userCycleIDArr.splice(indexOfWinner, 1);
      userIDArr.splice(indexOfWinner, 1);
    }
  });

  // randomize an index
  const randomIndex = Math.floor(Math.random() * userCycleIDArr.length);
  const winningUserCycleID = userCycleIDArr[randomIndex];
  await updateSessionWinner(winningUserCycleID, sessionID);

  const winningUserArr = await findUserFromID(userIDArr[randomIndex]);
  const winningUser = winningUserArr[0];
  console.log(winningUser);
  res.render('winner', { winningUser });
};

/** post handlers */

/**
 * post signup, append to db
 * @param {object} req request
 * @param {object} res response
 */
const signupHandler = async (req, res) => {
  console.log('post: ', req.url);

  const { username, email, password } = req.body;

  // search if there is already a username or email from db
  const userSearch = await findUserFromUsername(username);
  const emailSearch = await findUserFromEmail(email);

  const hash = bcrypt.hashSync(password, 12);

  if (userSearch.length !== 0) {
    res.redirect('/?e=user-taken');
    return;
  }

  if (emailSearch.length !== 0) {
    res.redirect('/?e=email-taken');
    return;
  }

  await createNewUser(username, email, hash);
  res.render('signupSuccess');
};

/**
 * login post handler, search from db and set cookie
 * @param {object} req request
 * @param {object} res response
 * @returns {undefined}
 */
const loginHandler = async (req, res) => {
  console.log('post:', req.url);
  const { username, password } = req.body;
  const userArr = await findUserFromUsername(username);
  // no user found
  if (userArr.length === 0) {
    res.redirect('/login?e=no-user');
    return;
  }

  const dbPwd = userArr[0].password;
  const pwdCorrect = bcrypt.compareSync(password, dbPwd);

  if (!pwdCorrect) {
    res.redirect('/login?e=wrong-pwd');
    return;
  }

  const userID = userArr[0].id;

  res.cookie('loggedUser', userID);
  res.redirect('/');
};

/**
 * cycle post handler, creates a cycle
 * @param {object} req request
 * @param {object} res response
 */
const createCycleHandler = async (req, res) => {
  console.log('post:', req.url);
  const {
    cyclename, frequency, payment,
  } = req.body;
  const { loggedUser } = req.cookies;
  await createCycle(cyclename, loggedUser, frequency, payment);
  res.redirect('/');
};

/**
 * post invite handler, make a new invite in db
 * @param {object} req request
 * @param {object} res response
 */
const inviteHandler = async (req, res) => {
  console.log('post:', req.url);
  const { invite } = req.body;
  const { cycleID } = req.params;
  const { loggedUser } = req.cookies;

  // user not found
  const inviteeArr = await findUserFromUsername(invite);
  if (inviteeArr.length === 0) {
    res.redirect('/?e=no-user');
    return;
  }

  // host invites themself
  const { id } = inviteeArr[0];
  if (id === Number(loggedUser)) {
    res.redirect('/?e=self-add');
    return;
  }

  // if user is already added to the user_cycle, no need to re-invite them
  const userCycleExists = await findUserCycleFromUserAndCycle(id, cycleID);
  if (userCycleExists.length !== 0) {
    res.redirect('/?e=already-in-cycle');
    return;
  }

  // if user is already invited
  const userInviteExists = await findInviteFromCycleIDAndInviteeID(id, cycleID);
  if (userInviteExists.length !== 0) {
    res.redirect('/?e=already-invited');
    return;
  }

  await createInvite(id, cycleID);
  res.redirect('/?s=successful-invite');
};

/**
 * post join invite handler, deletes the invites and creates an entry to users_cycle table
 * @param {object} req request
 * @param {object} res response
 */
const joinInviteHandler = async (req, res) => {
  console.log('post', req.url);
  const { inviteID } = req.params;
  const invite = await findInviteFromInviteId(inviteID);
  const cycleID = invite[0].cycle_id;
  await deleteInvite(inviteID);
  await createUserCycle(req.cookies.loggedUser, cycleID);
  res.redirect('/notifications/?s=join');
};

/** Delete Handlers */

/**
 * delete cycle handler, deletes cycle from multiple tables
 * @param {object} req request
 * @param {object} res response
 */
const cancelHandler = async (req, res) => {
  console.log('delete:', req.url);
  const { cycleID } = req.params;
  await cancelCycle(cycleID);
  res.redirect('/?s=deleted-cycle');
};

/**
 * delete invite handler, deletes invites and not joins a cycle
 * @param {object} req request
 * @param {object} res response
 */
const deleteInviteHandler = async (req, res) => {
  console.log('delete:', req.url);
  const { inviteID } = req.params;
  await deleteInvite(inviteID);
  res.redirect('/notifications/?s=not-join');
};

/** 404 handler */

/**
 * handler for 404 routes
 * @param {object} req request
 * @param {object} res response
 */
const errHandler = (req, res) => {
  console.log('get: ', req.url);
  res.status(404);
  if (!req.cookies.loggedUser) {
    res.render('not-found', { loggedIn: false });
    return;
  }
  res.render('not-found', { loggedIn: true });
};

/** routes */

/* get routes */
app.get('/', landingPageHandler);
app.get('/login', loginPageHandler);
app.get('/logout', logoutHandler);

/* post routes */
app.post('/signup', signupHandler);
app.post('/login', loginHandler);

/* get routes after login */
app.get('/profile', loginChecker, profileHandler);
app.get('/create', loginChecker, cycleHandler);
app.get('/notifications', loginChecker, notificationHandler);

/* get routes after login and checking whether you're in a cycle */
app.get('/overview/:cycleID', loginChecker, inCycleChecker, overviewHandler);

/* put routes after login */
app.put('/profile/:id', loginChecker, editProfileHandler);
app.put('/start/:cycleID', loginChecker, startCycleHandler);
app.put('/pay/:cycleID/:sessionID/:paymentID', loginChecker, verifyPayment);
app.put('/randomize/:cycleID/:sessionID', loginChecker, randomizeWinner);

/* post routes after login */
app.post('/create', loginChecker, createCycleHandler);
app.post('/invite/:cycleID', loginChecker, inviteHandler);
app.post('/handle/:inviteID', loginChecker, joinInviteHandler);

/* delete routes after login */
app.delete('/cancel/:cycleID', loginChecker, cancelHandler);
app.delete('/handle/:inviteID', loginChecker, deleteInviteHandler);

/** 404 handler */
app.get('*', errHandler);

/** start listening on port */
const PORT = 5050;
app.listen(PORT, () => { console.log(`app is listening on port ${PORT}`); });
