/* eslint-disable import/extensions */
import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import favicon from 'serve-favicon';
import path from 'path';
import { createNewUser, findUserFromEmail, findUserFromUsername } from './helper.js';

/** set up express and ejs */
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(favicon(path.join('public', 'favicon-white.ico')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

/**
 * get landing page
 * @param {object} req request
 * @param {object} res response
 */
const landingPageHandler = (req, res) => {
  console.log('get:', req.url);

  res.render('landing');
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

const loginHandler = async (req, res) => {
  console.log('post:', req.url);
  const { username, password } = req.body;
  const userArr = await findUserFromUsername(username);
  // no user found
  if (userArr.length === 0) {
    res.send('no user found');
    return;
  }

  console.log(userArr);
  const dbPwd = userArr[0].password;
  const pwdCorrect = bcrypt.compareSync(password, dbPwd);

  if (!pwdCorrect) {
    res.send('wrong password');
  }

  const userID = userArr[0].id;

  res.cookie('loggedUser', userID);
  res.redirect('/');
};

const errHandler = (req, res) => {
  console.log('get: ', req.url);
  res.status(404);
  res.render('not-found');
};

/** routes */
/* get routes */
app.get('/', landingPageHandler);
app.get('/login', loginPageHandler);

/* post routes */
app.post('/signup', signupHandler);
app.post('/login', loginHandler);

/** 404 handler */
app.get('*', errHandler);

/** start listening on port */
const PORT = 5050;
app.listen(PORT, () => { console.log(`app is listening on port ${PORT}`); });
