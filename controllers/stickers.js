var mongoose = require('mongoose');
var async = require('async');
var client = require(require('path').join(__base, 'app-s3.js'));
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var Pack = mongoose.model('Pack');
var s3 = require('s3');

// Use only with arrays of a SINGLE, PRIMITIVE type
// e.g. [String] or [int]
var uniq = function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

module.exports = [{
    path: '/sticker/:id',
    method: 'GET',
    handler: function(req, done) {
        var query_id = req.params.id;
        var query = {
            $or: [{
                name: query_id
            }]
        };
        if (/^[0-9a-f]{24}$/.test(query_id)) {
            query.$or.push({
                _id: query_id
            });
        }
        Sticker.findOne(query).populate({
            path: 'tags',
            select: 'name'
        }).populate({
            path: 'author',
            select: 'name location image'
        }).populate({
            path: 'pack',
            select: 'name'
        }).exec(function(err, sticker) {
            if (err) {
                done(true, {
                    message: err.message
                });
            } else {
                if (sticker) {
                    sticker.hits.total += 1;
                    sticker.hits.daily += 1;
                    sticker.hits.weekly += 1;
                    sticker.hits.monthly += 1;
                    sticker.save(function(err, sticker) {

                    });
                }
                done(false, {
                    message: (sticker) ? 'Sticker found' : 'No sticker found',
                    sticker: sticker
                });
            }
        });
    }
}, {
    path: '/stickers',
    method: 'GET',
    handler: function(req, done) {
        var query = {};
        var tasks = [];
        var tag_error;
        if (req.query.tag) {
            tasks.push(function(callback) {
                Tag.findOne({
                    name: {
                        $regex: new RegExp(req.query.tag, 'i')
                    }
                }).exec(function(err, tag) {
                    if (err) {
                        tag_error = {
                            error: err
                        };
                    } else {
                        if (tag) {
                            query.tags = tag._id;
                            tag.hits.daily += 1;
                            tag.hits.weekly += 1;
                            tag.hits.monthly += 1;
                            tag.hits.total += 1;
                            tag.save(function(err, tag) {

                            });
                        } else {
                            tag_error = {
                                error: false
                            };
                        }
                    }
                    callback(null);
                });
            });
        }
        async.series(tasks, function(err, results) {
            if (err) {
                done(true, {
                    message: err.message
                });
            } else {
                if (tag_error) {
                    if (tag_error.error) {
                        done(true, {
                            message: tag_error.error.message
                        });
                    } else {
                        done(false, {
                            message: 'No matching tag found',
                            stickers: []
                        });
                    }
                } else {
                    var sort = {};
                    if (req.query.type && req.query.type === 'trending') {
                        sort = {
                            'hits.daily': -1,
                            'hits.weekly': -1,
                            'hits.monthly': -1,
                            'hits.total': -1
                        };
                    }
                    var page = req.query.page ? req.query.page : 0;
                    var count = req.query.count ? req.query.count : 20;
                    Sticker.find().populate({
                        path: 'tags',
                        select: 'name'
                    }).populate({
                        path: 'author',
                        select: 'name'
                    }).populate({
                        path: 'pack',
                        select: 'name'
                    }).sort(sort).limit(count).skip(page * count).exec(function(err, stickers) {
                        if (err) {
                            done(true, {
                                message: err.message
                            });
                        } else {
                            if (stickers && stickers.length) {
                                // We don't count trending searches as hits
                                // because that would continue to reinforce the top searches
                                if (!req.query.type || req.query.type !== 'trending') {
                                    stickers.forEach(function(sticker) {
                                        sticker.hits.total += 1;
                                        sticker.hits.daily += 1;
                                        sticker.hits.weekly += 1;
                                        sticker.hits.monthly += 1;
                                        sticker.save(function(err, sticker) {

                                        });
                                    });
                                }
                            }
                            done(false, {
                                message: (stickers && stickers.length) ? 'Stickers found' : 'No stickers found',
                                stickers: stickers
                            });
                        }
                    });
                }
            }
        });
    }
}, {
    path: '/stickers',
    method: 'POST',
    upload: 'sticker',
    handler: function(req, done) {
        if (req.body.name && req.body.pack && req.body.tags && req.file) {
            Pack.findOne({
                _id: req.body.pack
            }).exec(function(err, pack) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                } else if (!pack) {
                    done(true, {
                        message: 'A pack by that id does not exist'
                    });
                } else {
                    var tags = [];
                    var tag_ids = [];
                    if (typeof req.body.tags === 'string') {
                        req.body.tags = req.body.tags.split(',');
                    }
                    var tag_strings = uniq(req.body.tags);
                    var calls = [];
                    tag_strings.forEach(function(tag_string) {
                        calls.push(function(callback) {
                            Tag.findOne({
                                name: tag_string
                            }).exec(function(err, tag) {
                                if (!err) {
                                    if (tag) {
                                        tags.push(tag);
                                        tag_ids.push(tag._id);
                                        callback(null);
                                    } else {
                                        var new_tag = new Tag({
                                            name: tag_string,
                                            stickers: [],
                                            hits: {
                                                daily: 0,
                                                weekly: 0,
                                                monthly: 0,
                                                total: 0
                                            }
                                        });
                                        new_tag.save(function(err, new_tag) {
                                            if (!err) {
                                                tags.push(new_tag);
                                                tag_ids.push(new_tag._id);
                                                callback(null);
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                    async.parallel(calls, function(err, results) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        } else {
                            var sticker = new Sticker({
                                name: req.body.name,
                                author: pack.author,
                                pack: pack._id,
                                tags: tag_ids,
                                hits: {
                                    daily: 0,
                                    weekly: 0,
                                    monthly: 0,
                                    total: 0
                                }
                            });
                            var key = require('path').join('stickers', sticker._id.toString());
                            var params = {
                                localFile: req.file.path,
                                s3Params: {
                                    Bucket: __bucket,
                                    Key: key
                                }
                            };
                            var uploader = client.uploadFile(params);
                            uploader.on('error', function(err) {
                                done(err, {
                                    message: err.message
                                });
                            });
                            uploader.on('end', function() {
                                sticker.image = s3.getPublicUrl(__bucket, key);
                                sticker.save(function(err, sticker) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        var calls = [];
                                        tags.forEach(function(tag) {
                                            calls.push(function(callback) {
                                                tag.stickers.push(sticker._id);
                                                tag.save(function(err, tag) {
                                                    callback(null);
                                                });
                                            });
                                        });
                                        async.parallel(calls, function(err, results) {
                                            if (err) {
                                                done(err, {
                                                    message: err.message
                                                });
                                            } else {
                                                done(null, {
                                                    message: 'Sticker successfully created',
                                                    sticker: sticker
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        } else {
            done(true, {
                message: 'Required parameters missing'
            });
        }
    }
}, {
    path: '/sticker/:id',
    method: 'PUT',
    handler: function(req, done) {
        done(null, {
            message: 'Not implemented'
        });
    }
}];
