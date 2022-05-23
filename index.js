import express from 'express';
import methodOverride from 'method-override';
import pg from 'pg';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import favicon from 'serve-favicon';
import path from 'path';

/** postgres config */
const pgConnectionConfigs = {
  user: 'sho',
  host: 'localhost',
  database: 'bagelfunds',
  port: 5432, // Postgres server always runs on this port
};
const pool = new pg.Pool(pgConnectionConfigs);

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
  pool.query('SELECT * FROM users').then((result) => {
    console.log(result.rows);
  }).catch((err) => {
    console.log(err);
  });
  res.render('landing');
};

/**
 * get login page
 * @param {object} req request
 * @param {object} res response
 */
const loginGetHandler = (req, res) => {
  console.log('get:', req.url);
  res.render('login');
};

/**
 * post signup, append to db
 * @param {object} req request
 * @param {object} res response
 */
const signupHandler = (req, res) => {
  console.log('post: ', req.url);
  const { username, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 12);

  const dbQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';

  pool.query(dbQuery, [username, email, hash]).then(() => { res.render('signupSuccess'); }).catch((err) => { console.log(err); res.redirect('/error'); });
};

const errHandler = (req, res) => {
  console.log('get: ', req.url);
  res.status(404);
  res.render('not-found');
};

/** routes */
/* get routes */
app.get('/', landingPageHandler);
app.get('/login', loginGetHandler);

/* post routes */
app.post('/signup', signupHandler);

/** 404 handler */
app.get('*', errHandler);

/** start listening on port */
const PORT = 5050;
app.listen(PORT, () => { console.log(`app is listening on port ${PORT}`); });
