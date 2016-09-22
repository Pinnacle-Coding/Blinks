/*
Project Workflow
================

There are three remote repositories. Branches are listed underneath the branch name ...
1) origin
    - master (global repository, linked to production:master, contributions synced here)
    - develop (global repository, linked to staging:master, contributions synced here)
2) staging
    - master (https://blinks-staging.herokuapp.com)
3) production
    - master (https://blinks-app.herokuapp.com)

GIT COMMANDS:
1) Development:
    - git checkout develop
    - git add .
    - git commit -m "..."
    - git push origin develop
    - git push staging develop:master
2) Production:
    - git checkout master
    - Merge master with develop branch
    - git push origin master
    - git push production master

TODO:
    - Fork to dev/staging server [DONE]
    - AWS to Cloudfront
    - Created timestamps [DONE]
    - Updated timestamps [DONE]
    - Replace spaces with underscores
    - New packs <-- api calls
    - Store small, medium, large images
*/

global.__base = __dirname + '/';

// Production = blinks
// Development = blinks-staging
global.__bucket = 'blinks';

// Temporary until admin accounts are made
global.__password = new Buffer('V29vZGxha2U4MDU=', 'base64').toString();

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

// MongoDB
var mongoose = require('mongoose');
var Text = mongoose.model('Text', new mongoose.Schema({
    content: String,
    hash: String
}));
// Production = mongodb://blinks:insaneMembrane1@ds035786.mlab.com:35786/blinks-staging
// Development = mongodb://blinks:insaneMembrane1@ds027356-a0.mlab.com:27356,ds027356-a1.mlab.com:27356/blinks?replicaSet=rs-ds027356
mongoose.connect('mongodb://blinks:insaneMembrane1@ds027356-a0.mlab.com:27356,ds027356-a1.mlab.com:27356/blinks?replicaSet=rs-ds027356');
require('./models/models.js');

// Port
app.set('port', (process.env.PORT || 5000));

// Website directory
app.use(express.static(__dirname + '/public'));

// View engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Body parser for POST/PUT requests
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// API route
app.use('/api', require('./routes/api'));

// Use index as base template
app.use(function(req, res) {
    res.status(200).render('index');
});

// Run server
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

// Run cron
var cron = require('./cron.js');
var timeoutCallback = function() {
    setTimeout(function() {
        cron.run(timeoutCallback);
    }, 1000 * 60 * 60);
};
cron.run(timeoutCallback);
