var mongoose = require('mongoose');
var Metrics = mongoose.model('Metrics');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var async = require('async');

module.exports = {
    run: function(callback) {
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
                var last_weekly_update = metrics.hits.weekly;
                var last_monthly_update = metrics.hits.monthly;
                var daily_update = last_daily_update <= today;
                var weekly_update = last_weekly_update <= today;
                var monthly_update = last_monthly_update <= today;
                var tasks = [];
                tasks.push(function(callback) {
                    Author.find().exec(function(err, authors) {
                        if (!err && authors) {
                            authors.forEach(function(author) {
                                if (daily_update) {
                                    author.hits.daily = 0;
                                }
                                if (weekly_update) {
                                    author.hits.weekly = 0;
                                }
                                if (monthly_update) {
                                    author.hits.monthly = 0;
                                }
                                author.save(function(err, author) {

                                });
                            });
                        }
                        callback(null);
                    });
                });
                tasks.push(function(callback) {
                    Pack.find().exec(function(err, packs) {
                        if (!err && packs) {
                            packs.forEach(function(pack) {
                                if (daily_update) {
                                    pack.hits.daily = 0;
                                }
                                if (weekly_update) {
                                    pack.hits.weekly = 0;
                                }
                                if (monthly_update) {
                                    pack.hits.monthly = 0;
                                }
                                pack.save(function(err, pack) {

                                });
                            });
                        }
                        callback(null);
                    });
                });
                tasks.push(function(callback) {
                    Sticker.find().exec(function(err, stickers) {
                        if (!err && stickers) {
                            stickers.forEach(function(sticker) {
                                if (daily_update) {
                                    sticker.hits.daily = 0;
                                }
                                if (weekly_update) {
                                    sticker.hits.weekly = 0;
                                }
                                if (monthly_update) {
                                    sticker.hits.monthly = 0;
                                }
                                sticker.save(function(err, sticker) {

                                });
                            });
                        }
                        callback(null);
                    });
                });
                tasks.push(function(callback) {
                    Tag.find().exec(function(err, tags) {
                        if (!err && tags) {
                            tags.forEach(function(tag) {
                                if (daily_update) {
                                    tag.hits.daily = 0;
                                }
                                if (weekly_update) {
                                    tag.hits.weekly = 0;
                                }
                                if (monthly_update) {
                                    tag.hits.monthly = 0;
                                }
                                tag.save(function(err, tag) {

                                });
                            });
                        }
                        callback(null);
                    });
                });
                async.parallel(tasks, function(err, results) {
                    metrics.save(function(err, metrics) {
                        if (err) {
                            console.log('Error saving metrics: ' + err.message);
                        } else {
                            console.log('Metrics updated and saved for app v' + version);
                        }
                    });
                });
            } else {
                console.log('Error parsing metrics: ' + err.message);
            }
        });
    }
};
