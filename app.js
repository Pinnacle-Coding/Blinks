global.__base = __dirname + '/';
global.__bucket = 'blinks';

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

// Dashboard
var links = {
    '/': '/views/index.html',
    '/packs': '/views/packs.html',
    '/authors': '/views/authors.html',
    '/stickers': '/views/stickers.html'
};
var get_link = function(url, file) {
    app.get(url, function(req, res) {
        res.status(200).sendFile(path.join(__dirname, file));
    });
};
for (var k in links) {
    if (links.hasOwnProperty(k)) {
        get_link(k, links[k]);
    }
}

// Delete old uploads folder
var uploadsDirectory = path.join(__dirname, 'uploads');
fs.access(uploadsDirectory, fs.F_OK, function(err) {
    if (!err) {
        console.log('/uploads exists. Deleting ...');
        var fs = require('fs');
        var rmDir = function(dirPath) {
            var files;
            try {
                files = fs.readdirSync(dirPath);
            } catch (e) {
                return;
            }
            if (files.length > 0)
                for (var i = 0; i < files.length; i++) {
                    var filePath = dirPath + '/' + files[i];
                    if (fs.statSync(filePath).isFile())
                        fs.unlinkSync(filePath);
                    else
                        rmDir(filePath);
                }
            fs.rmdirSync(dirPath);
        };
        rmDir(uploadsDirectory);
    } else {
        console.log('/uploads does not exist.');
    }
});

// API route
app.use('/api', require('./routes/api'));

// 404 errors
app.use(function(req, res) {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
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
