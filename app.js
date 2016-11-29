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
    - Store small, medium, large images
*/

global.__base = __dirname + '/';

global.__bucket = process.env.BLINKS_AWS_BUCKET;
if (process.env.BLINKS_CLOUDFRONT_PREFIX === 'undefined') {
    global.__cloudfront = undefined;
}
else {
    global.__cloudfront = process.env.BLINKS_CLOUDFRONT_PREFIX;
}

global.__password = process.env.BLINKS_PASSWORD;

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

mongoose.connect(process.env.BLINKS_MONGODB);

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
var init = require('./init.js');
var cron = require('./cron.js');
var timeoutCallback = function() {
    setTimeout(function() {
        cron.run(timeoutCallback);
    }, 1000 * 60 * 60);
};
init.run(function () {
    cron.run(timeoutCallback);
});
