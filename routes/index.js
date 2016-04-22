var app = require('express');
var router = app.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library
//S3 requires
var http = require('http');
var path = require('path');
var aws = require('aws-sdk');

// our db model
var Jar = require("../models/jar.js");
var Account = require("../models/account.js");
var Project = require("../models/project.js");

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(Account.authenticate()));

// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  Account.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


/*
 * Load the S3 information from the environment variables.
 http://aws.amazon.com/myBucket/myKey/moreKey.jpg
 */
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;
aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });
    var s3 = new aws.S3(); 
    var s3_params = { 
        Bucket: S3_BUCKET, 
        
        // Expires: 60,  
    }; 


/*
 * Respond to GET requests to /sign_s3.
 * Upon request, return JSON containing the temporarily-signed S3 request and the
 * anticipated URL of the image.
 */
 
router.get('/sign_s3', function(req, res){
    aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });
    var s3 = new aws.S3(); 
    var s3_params = { 
        Bucket: S3_BUCKET, 
        Key: req.query.file_name, 
        Expires: 60, 
        ContentType: req.query.file_type, 
        ACL: 'public-read'
    }; 
    s3.getSignedUrl('putObject', s3_params, function(err, data){ 
        if(err){ 
            console.log(err); 
        }
        else{ 
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name 
            };
            res.write(JSON.stringify(return_data));
            res.end();
        } 
    });
});





/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {
  
  var jsonData = {
  	'name': 'fireJar',
  	'api-status':'OK'
  }

  // respond with json data
  res.json(jsonData)
});



router.get('/jars', function(req,res){
  res.render('jars.html');

});

router.get('/bridge', function(req,res){
  res.render('bridge.html');
});


router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    // console.log(req.user);
    res.redirect('/session');

});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/jars');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


router.get('/session', function(req, res){

    console.log("and the user is:");
    console.log(req.user.username);
    res.render('user', { user : req.user });



});




// *********** REST ***************** API ******************** ##
// ***************** API ***************** REST ************** ##
// *********** REST ***************** API ******************** ##

// /**
//  * POST '/api/create'
//  * Receives a POST request of the new user and location, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Person
//  * @return {Object} JSON
//  */

router.post('/api/create', function(req, res){

    console.log('the data we received is --> ');

    console.log(req.body);

    // pull out the information from the req.body
    var title = req.body.title;
    
    var tags = req.body.tags.split(',');
    
    
    var GPS = {"lat":"","lon":""};
    var sGps = req.body.GPS.split(',');
    GPS.lat = sGps[0];
    GPS.lon = sGps[1];
    
    var SSID = req.body.SSID;

    var UDID = req.body.UDID;

    var url = req.body.url;
    var owner = req.body.owner;
    var project = req.body.project;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var jarObj = {
      title: title,
      tags : tags,
      GPS : GPS,
      SSID: SSID,
      UDID: UDID,
      url: url,
      owner: owner,
      project: project
    };

      console.log('received this all gooood');
     
      // now, let's add this to our jar object from above
      
      // now, let's save it to the database
      // create a new jar model instance, passing in the object we've created

      var jar = new Jar(jarObj);

      // now, save that jar instance to the database
      // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
      jar.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving jar'};
          console.log('shit');
          console.log(error);
          return res.json(error);

        }
        // Jar.find({})
        //   .populate('owner')
        //   .exec(function(error, posts) {
        //         console.log(JSON.stringify(posts, null, "\t"))
        //   })


        console.log('saved a new jar!');
        console.log(data);

        // now return the json data of the new jar
        var jsonData = {
          status: 'OK',
          jar: data
        }

        return res.json(jsonData);

      });
      // jar
      // .populate('_owner')
      // .exec(function (err, jar) {
      //   if (err) return handleError(err);
      //   console.log('The creator is %s', jar._owner.username);
     
      // });


   
});
router.post('/api/createProj', function(req, res){

    console.log('the data we received is --> ');

    console.log(req.body);

    // pull out the information from the req.body
    var title = req.body.title;
    
    var tags = req.body.tags.split(',');
    
    var owner = req.body.owner;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var projObj = {
      title: title,
      tags : tags,
      url: "dummy_url",
      owner: owner,
      
    };

      console.log('received PROJ all gooood');
     
    

      var proj = new Project(projObj);

      // now, save that  instance to the database
      // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
      proj.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving jar'};
          console.log('shit');
          console.log(error);
          return res.json(error);

        }
        Project.find({})
          .populate('owner')
          .exec(function(error, projs) {
                console.log(JSON.stringify(projs, null, "\t"))
          })


        console.log('saved a new proj!');
        console.log(data);

        // now return the json data of the new jar
        var jsonData = {
          status: 'OK',
          jar: data
        }

        return res.json(jsonData);

      });
      // jar
      // .populate('_owner')
      // .exec(function (err, jar) {
      //   if (err) return handleError(err);
      //   console.log('The creator is %s', jar._owner.username);
      //   // prints "The creator is Aaron"
      // });


   
});

// /**
//  * GET '/api/get/:id'
//  * Receives a GET request specifying the jar to get
//  * @param  {String} req.param('id'). The jarId
//  * @return {Object} JSON
//  */

router.get('/api/get/:id', function(req, res){

  var requestedId = req.param('id');

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Jar.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that jar'};
       return res.json(error);
    }

    // otherwise respond with JSON data of the jar
    var jsonData = {
      status: 'OK',
      jar: data
    }

    return res.json(jsonData);
  
  })
})

// /**
//  * GET '/api/get'
//  * Receives a GET request to get all jar details
//  * @return {Object} JSON
//  */

router.get('/api/get', function(req, res){

  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Jar.find(function(err, data){
    // if err or no jars found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find jars'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      jars: data
    } 

    res.json(jsonData);

  });

});





router.get('/api/delete/:id', function(req, res){

  var requestedId = req.param('id');

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Jar.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that jar to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})



module.exports = router;