global.__base = __dirname + '/';
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
mongoose.connect('mongodb://dmhacker:insaneMembrane1@ds153735.mlab.com:53735/blinks');
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
