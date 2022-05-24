import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import favicon from 'serve-favicon';
import path from 'path';
import moment from 'moment';
import {
  createCycle,
  createNewUser, findUserFromEmail, findUserFromID, findUserFromUsername, updateUser,
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
 * Checks whether user logged in or not, will redirect to home if not
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const loginChecker = (req, res, next) => {
  console.log('middleware:', req.url);
  if (!req.cookies.loggedUser) {
    res.redirect('/');
  }
  next();
};

/** Get handlers */

/**
 * get landing page / user dashboard
 * @param {object} req request
 * @param {object} res response
 */
const landingPageHandler = async (req, res) => {
  console.log('get:', req.url);

  if (!req.cookies.loggedUser) {
    res.render('landing');
    return;
  }

  const userDetailsArr = await findUserFromID(req.cookies.loggedUser);
  const userDetails = userDetailsArr[0];
  res.render('userDashboard', { userDetails });
};

/**
 * get login page
 * @param {object} req request
 * @param {object} res response
 */
const loginPageHandler = (req, res) => {
  console.log('get:', req.url);
  res.render('login');
};

/**
 * logout get handler, deletes login cookie
 * @param {object} req request
 * @param {object} res response
 */
const logoutHandler = (req, res) => {
  console.log('get:', req.url);
  res.clearCookie('loggedUser');
  res.redirect('/');
};

/**
 * profile get handler, shows profile
 * @param {object} req request
 * @param {object} res response
 */
const profileHandler = async (req, res) => {
  console.log('get:', req.url);

  const userDetailsArr = await findUserFromID(req.cookies.loggedUser);
  const userDetails = userDetailsArr[0];
  res.render('profile', { userDetails });
};

const cycleHandler = async (req, res) => {
  console.log('get:', req.url);
  res.render('create', { moment });
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
    res.send('username is already taken');
    return;
  }

  if (emailSearch.length !== 0) {
    res.send('email is already in use');
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
    res.send('no user found');
    return;
  }

  const dbPwd = userArr[0].password;
  const pwdCorrect = bcrypt.compareSync(password, dbPwd);

  if (!pwdCorrect) {
    res.send('wrong password');
    return;
  }

  const userID = userArr[0].id;

  res.cookie('loggedUser', userID);
  res.redirect('/');
};

const createCycleHandler = async (req, res) => {
  console.log('post:', req.url);
  const {
    cyclename, startdate, frequency, payment,
  } = req.body;
  const { loggedUser } = req.cookies;
  await createCycle(cyclename, loggedUser, startdate, frequency, payment);
  res.redirect('/');
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

/* get routes after login */
app.get('/profile', loginChecker, profileHandler);
app.get('/create', loginChecker, cycleHandler);

/* put routes after login */
app.put('/profile/:id', loginChecker, editProfileHandler);

/* post routes */
app.post('/signup', signupHandler);
app.post('/login', loginHandler);

/* post routes after login */
app.post('/create', loginChecker, createCycleHandler);

/** 404 handler */
app.get('*', errHandler);

/** start listening on port */
const PORT = 5050;
app.listen(PORT, () => { console.log(`app is listening on port ${PORT}`); });
