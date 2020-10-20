// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

// execute our config file
const config = require('./config.js');

 // replaced the hardcoded dburl with the config variable
const dbURL = process.env.MONGODB_URI || config.dburl;

mongoose.connect(dbURL, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

/**
    //REMOVED THE REDIS URL & AUTH PARSING BECAUSE IT IS NOW HANDLED BY THE CONFIGURATION
**/

// pull in our routes
const router = require('./router.js');

// switched our port to match our environment config
const port = config.http.port;

const app = express();
// switched our asset path to match the environment in our config
app.use('/assets', express.static(path.resolve(config.staticAssets.path)));
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
    // switched our redis config variables to match the environment in our config
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
    pass: config.redis.pass,
  }),
    // switched our secret key with config variable for the environment
  secret: config.sessions.secret,
  resave: true,
  saveUninitialized: true,
}));
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
// switched our favicon path to reflect our environment config
app.use(favicon(path.resolve(`${config.staticAssets.path}/img/favicon.png`)));
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
