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
        // Retag stickers
        calls.push(function(callback) {
            Sticker.find().exec(function(err, stickers) {
                if (err) {
                    callback(err);
                } else {
                    var subcalls = [];
                    stickers.forEach(function(sticker) {
                        sticker.tags.forEach(function(tag) {
                            subcalls.push(function(callback) {
                                Tag.findOne({
                                    _id: tag
                                }).exec(function(err, tag) {
                                    var isInArray = tag.stickers.some(function(tag_sticker) {
                                        return tag_sticker === sticker._id;
                                    });
                                    if (!isInArray) {
                                        tag.stickers.push(sticker._id);
                                        tag.save(function (err, tag) {
                                            callback(null);
                                        });
                                    }
                                    else {
                                        callback(null);
                                    }
                                });
                            });
                        });
                    });
                    async.series(subcalls, function(err, results) {
                        callback(null);
                    });
                }
            });
        });
        // Fix timestamps
        calls.push(function(callback) {
            var models = [Sticker, Author, Pack, Tag];
            var populate_subcalls = [];
            var subcalls = [];
            models.forEach(function(Model) {
                populate_subcalls.push(function(callback) {
                    Model.find().exec(function(err, objs) {
                        objs.forEach(function(model_obj) {
                            subcalls.push(function(callback) {
                                model_obj.createdAtTimestamp = model_obj.createdAt.getTime();
                                model_obj.updatedAtTimestamp = model_obj.updatedAt.getTime();
                                model_obj.noUpdate = true;
                                model_obj.save(function(err, model_obj) {
                                    callback(null);
                                });
                            });
                        });
                        callback(null);
                    });
                });
            });
            async.series(populate_subcalls, function(err, results) {
                async.parallel(subcalls, function(err, results) {
                    if (err) {
                        console.log("Error generating timestamps: " + err.message);
                    } else {
                        console.log("Updated timestamps.");
                    }
                    callback(null);
                });
            });
        });
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
                    var last_weekly_update = metrics.hits.weekly;
                    var last_monthly_update = metrics.hits.monthly;
                    var daily_update = last_daily_update <= today;
                    var weekly_update = last_weekly_update <= today;
                    var monthly_update = last_monthly_update <= today;
                    var subcalls = [];
                    subcalls.push(function(callback) {
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
                    subcalls.push(function(callback) {
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
                    subcalls.push(function(callback) {
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
                    subcalls.push(function(callback) {
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
                    async.parallel(subcalls, function(err, results) {
                        if (daily_update) {
                            var daily_future = new Date();
                            daily_future.setDate(daily_future.getDate() + 1);
                            metrics.hits.daily = daily_future;
                        }
                        if (weekly_update) {
                            var weekly_future = new Date();
                            weekly_future.setDate(weekly_future.getDate() + 7);
                            metrics.hits.weekly = weekly_future;
                        }
                        if (monthly_update) {
                            var monthly_future = new Date();
                            monthly_future.setMonth(monthly_future.getMonth() + 1);
                            metrics.hits.monthly = monthly_future;
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
