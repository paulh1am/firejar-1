var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');
var http = require('http');

var app = express();
var io = require('socket.io').listen(http);

// if in development mode, load .env variables
if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

// connect to database
app.db = mongoose.connect(process.env.MONGOLAB_URI);

// view engine setup - this app uses Hogan-Express
// https://github.com/vol4ok/hogan-express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout','layout');
app.engine('html', require('hogan-express'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// our routes will be contained in routes/index.js
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

//http server
var httpServer = http.createServer();

// Tell that server to listen on port 8081
httpServer.listen(3600);  

console.log('Server listening on port 3600');


// socket server



io.sockets.on('connection', 
  // We are given a websocket object in our function
function (socket) {
  

    console.log("We have a NEW client: " + socket.id);
    


    // socket.on('mapmarker', function(data) {
    //  socket.broadcast.emit("mapmarker", data);
    // });
//
    socket.on('mapmarker', function(data) {
      console.log("got marker");

      
      //socket.broadcast.emit -- won't send to new connection --

    });

    // socket.on('poem', function(data) {
    //   console.log(data);
    //   var entry = data[0];
    //   var newline = data[1];
    //   poems[entry]+= newline;
    //   console.log(poems);

    //   io.sockets.emit("poems", poems);




    // }); 



  }
);




// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
