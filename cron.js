var mongoose = require('mongoose');
var Metrics = mongoose.model('Metrics');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var async = require('async');

module.exports = {
    run: function(callback) {
        var calls = [];
        // Update hits
        calls.push(function(callback) {
            var version = require('./package.json').version;
            var today = new Date();
            Metrics.findOne({
                version: version
            }).exec(function(err, metrics) {
                if (!err) {
                    if (!metrics) {
                        metrics = new Metrics({
                            version: version
                        });
                    }
                    var last_daily_update = metrics.hits.daily;
                    var daily_update = last_daily_update <= today;
                    var subcalls = [];
                    [Pack, Author, Sticker, Tag].forEach(function (schema) {
                        subcalls.push(function (callback) {
                            schema.find().exec(function (err, objs) {
                                if (!err && objs) {
                                    objs.forEach(function (obj) {
                                        if (daily_update) {
                                            var days_tracking = obj.hits.counts.length;
                                            for (var i = 1; i < days_tracking; i++) {
                                                obj.hits.counts[i - 1] = obj.hits.counts[i];
                                            }
                                            obj.hits.counts[days_tracking - 1] = 0;
                                            obj.hits.score = 0;
                                            for (var j = 0; j < days_tracking; j++) {
                                                obj.hits.score += (j + 1) * obj.hits.counts[j];
                                            }
                                        }
                                        obj.noUpdate = true;
                                        obj.save(function (err, obj) {

                                        });
                                    });
                                }
                                callback(null);
                            });
                        });
                    });
                    async.parallel(subcalls, function(err, results) {
                        if (daily_update) {
                            var daily_future = new Date();
                            daily_future.setDate(daily_future.getDate() + 1);
                            metrics.hits.daily = daily_future;
                        }
                        metrics.save(function(err, metrics) {
                            if (err) {
                                console.log('Error saving metrics: ' + err.message);
                            } else {
                                console.log('Metrics updated and saved for app v' + version);
                            }
                            callback(null);
                        });
                    });
                } else {
                    console.log('Error parsing metrics: ' + err.message);
                    callback(null);
                }
            });
        });
        async.series(calls, function(err, results) {
            console.log("Cron done.");
            callback();
        });
    }
};
