var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var mongoose = require('mongoose');
var Text = mongoose.model('Text', new mongoose.Schema({
    content: String,
    hash: String
}));
mongoose.connect('mongodb://dmhacker:insaneMembrane1@ds153735.mlab.com:53735/blinks');
require('./models/models.js');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


