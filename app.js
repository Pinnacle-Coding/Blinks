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
1) Production:
    - git checkout master
    - git merge -X theirs develop
    - git push origin master
    - git push production master
2) Development:
    - git checkout develop
    - git merge -X theirs master
    - git push origin develop
    - git push staging develop:master

TODO:
    - Fork to dev/staging server [DONE]
    - AWS to Cloudfront [DONE]
    - Created timestamps [DONE - see cron script + mongoose middleware]
    - Updated timestamps [DONE - see cron script + mongoose middleware]
    - Replace spaces with underscores [DONE]
    - New packs <-- api calls [DONE]
    - 'Is animated sticker?' boolean field
    - Hits API [DONE]
    - Store small, medium, large images
    - Currently, whenever you create a object, you have to MANUALLY add the timestamp. Automate this.
*/

global.__base = __dirname + '/';

if (process.env.BLINKS_NODE_ENV === 'production') {
    global.__bucket = 'blinks';
    global.__cloudfront = 'dyhd59svym94q';
} else {
    global.__bucket = 'blinks-dev';
    global.__cloudfront = undefined;
}

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

if (process.env.BLINKS_NODE_ENV === 'production') {
    mongoose.connect('mongodb://blinks:insaneMembrane1@ds027356-a0.mlab.com:27356,ds027356-a1.mlab.com:27356/blinks?replicaSet=rs-ds027356');
} else {
    mongoose.connect('mongodb://blinks:insaneMembrane1@ds035786.mlab.com:35786/blinks-staging');
}

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
