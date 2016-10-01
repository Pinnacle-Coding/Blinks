var mongoose = require('mongoose');
var Metrics = mongoose.model('Metrics');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var async = require('async');
var https = require('https');
var fileType = require('file-type');

// Use only with arrays of a SINGLE, PRIMITIVE type
// e.g. [String] or [int]
var uniq = function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

module.exports = {
    run: function (callback) {
        var calls = [];
        // Animated stickers
        calls.push(function (callback) {
            Sticker.find().exec(function (err, stickers) {
                var subcalls = [];
                if (!err && stickers) {
                    stickers.forEach(function (sticker) {
                        subcalls.push(function (callback) {
                            https.get(sticker.image, res => {
                                res.once('data', chunk => {
                                    res.destroy();
                                    var type = fileType(chunk);
                                    sticker.animated = (type.mime.indexOf('gif') !== -1 || type.mime.indexOf('apng') !== -1);
                                    sticker.save(function (err, sticker) {
                                        callback(null);
                                    });
                                });
                            });
                        });
                    });
                }
                async.parallel(subcalls, function (err, results) {
                    callback(err ? err : null);
                });
            });
        });
        /*
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
        // Make sticker array for each tag full of unique elements
        // Do the same for tags in each sticker
        calls.push(function (callback) {
            Tag.find().exec(function (err, tags) {
                var subcalls = [];
                if (!err && tags) {
                    tags.forEach(function (tag) {
                        subcalls.push(function (callback) {
                            tag.stickers = uniq(tag.stickers);
                            tag.save(function (err, tag) {
                                callback(null);
                            });
                        });
                    });
                }
                async.parallel(subcalls, function (err, results) {
                    Sticker.find().exec(function (err, stickers) {
                        var subcalls = [];
                        if (!err && stickers) {
                            stickers.forEach(function (sticker) {
                                subcalls.push(function (callback) {
                                    sticker.tags = uniq(sticker.tags);
                                    sticker.save(function (err, sticker) {
                                        callback(null);
                                    });
                                });
                            });
                        }
                        async.parallel(subcalls, function (err, results) {
                            callback(err ? err : null);
                        });
                    });
                });
            });
        });
        */
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
        async.series(calls, function (err, results) {
            console.log("Init done.");
            callback();
        });
    }
};
