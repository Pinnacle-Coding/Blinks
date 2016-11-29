var mongoose = require('mongoose');
var async = require('async');
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');

module.exports = {
    getStats: {
        path: '/metrics/stats',
        method: 'GET',
        handler: function (req, done) {
            var stats = {};
            var calls = [];
            calls.push(function (callback) {
                Sticker.find().count(function (err, count) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        stats.stickers = count;
                        callback(null);
                    }
                });
            });
            calls.push(function (callback) {
                Tag.find().count(function (err, count) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        stats.tags = count;
                        callback(null);
                    }
                });
            });
            calls.push(function (callback) {
                Pack.find().count(function (err, count) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        stats.packs = count;
                        callback(null);
                    }
                });
            });
            calls.push(function (callback) {
                Author.find().count(function (err, count) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        stats.authors = count;
                        callback(null);
                    }
                });
            });
            async.parallel(calls, function (err, results) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                }
                else {
                    done(null, {
                        message: 'Stats successfully generated',
                        stats: stats
                    });
                }
            });
        }
    }
};
