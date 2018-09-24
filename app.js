var compression = require('compression')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressExpeditious = require('express-expeditious')
var expeditiousEngineMemory = require('expeditious-engine-memory')

var fiisRouter = require('./routes/fiis');

var app = express();

cacheRequests()

app.use(compression())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(__dirname + '/frontend/dist'))

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/dist/index.html'))
})

app.use('/api/fiis', fiisRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  res.render('error');
});

function cacheRequests() {
  var expressCache = expressExpeditious({
    statusCodeExpires: {
      400: '5 seconds',
      404: '5 seconds',
      500: '5 seconds',
      502: '5 seconds'
    },
    namespace: 'expresscache',
    defaultTtl: '20 minute',
    engine: expeditiousEngineMemory()
  });
  app.use(expressCache)
}

module.exports = app;