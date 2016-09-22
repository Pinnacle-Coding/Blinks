global.__base = __dirname + '/';

// Production = blinks
// Development = blinks-staging
global.__bucket = 'blinks-staging';

/*
TODO:
  - Fork to dev/staging server
  - AWS to Cloudfront
  - Created timestamps
  - Updated timestamps
  - Replace spaces with underscores
  - New packs <-- api calls
  - Store small, medium, large images
*/

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
mongoose.connect('mongodb://blinks:insaneMembrane1@ds035786.mlab.com:35786/blinks-staging');
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

// Add created field to old items
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
Sticker.find().exec(function (err, stickers) {
    stickers.forEach(function (sticker) {
        sticker.created = sticker._id.getTimestamp();
    });
});
Author.find().exec(function (err, authors) {
    authors.forEach(function (author) {
        author.created = author._id.getTimestamp();
        author.save(function (err, author) {

        });
    });
});
Pack.find().exec(function (err, packs) {
    packs.forEach(function (pack) {
        pack.created = pack._id.getTimestamp();
        pack.save(function (err, pack) {

        });
    });
});
Tags.find().exec(function (err, tags) {
    tags.forEach(function (tag) {
        if (!tag.created) {
            tag.created = tag._id.getTimestamp();
            tag.save(function (err, tag) {

            });
        }
    });
});

// Run cron
var cron = require('./cron.js');
var timeoutCallback = function() {
    setTimeout(function() {
        cron.run(timeoutCallback);
    }, 1000 * 60 * 60);
};
cron.run(timeoutCallback);
