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
    run: function(callback) {
        var calls = [];
        calls.push(function (callback) {
            Sticker.find().exec(function (err, stickers) {
                if (!err && stickers) {
                    stickers.forEach(function (sticker) {
                        if (sticker._id.equals(new mongoose.Types.ObjectId('57d868857079c70300dcc608')) || !sticker.author || sticker.author === null || sticker.author === undefined) {
                            sticker.remove(function (err) {

                            });
                        }
                    });
                    callback(null);
                }
            });
        });
        // Animated stickers
        calls.push(function(callback) {
            Sticker.find().exec(function(err, stickers) {
                var subcalls = [];
                if (!err && stickers) {
                    stickers.forEach(function(sticker) {
                        subcalls.push(function(callback) {
                            https.get(sticker.image, res => {
                                res.once('data', chunk => {
                                    res.destroy();
                                    var type = fileType(chunk);
                                    sticker.animated = (type.mime.indexOf('gif') !== -1 || type.mime.indexOf('apng') !== -1);
                                    sticker.noUpdate = true;
                                    sticker.save(function(err, sticker) {
                                        callback(null);
                                    });
                                });
                            });
                        });
                    });
                }
                async.parallel(subcalls, function(err, results) {
                    callback(err ? err : null);
                });
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
        async.series(calls, function(err, results) {
            console.log("Init done.");
            callback();
        });
    }
};
