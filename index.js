import express from 'express';
import methodOverride from 'method-override';
import pg from 'pg';
import cookieParser from 'cookie-parser';

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
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

const landingPageGetHandler = (req, res) => {
  console.log('get:', req.url);
  pool.query('SELECT * FROM users').then((result) => {
    console.log(result.rows);
  }).catch((err) => {
    console.log(err);
  });
  res.render('landing');
};

const errHandler = (req, res) => {
  console.log('get: ', req.url);
  res.status(404);
  res.render('not-found');
};

/** routes */
app.get('/', landingPageGetHandler);

/** 404 handler */
app.get('*', errHandler);

/** start listening on port */
const PORT = 5050;
app.listen(PORT, () => { console.log(`app is listening on port ${PORT}`); });
