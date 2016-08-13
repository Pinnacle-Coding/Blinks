var mongoose = require('mongoose');
var async = require('async');
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');

module.exports = [
    {
        path: '/sticker/:id',
        method: 'GET',
        handler: function (req, done) {
            var query_id = req.params.id
            var query = {
                $or: [
                    {
                        name: query_id
                    }
                ]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query['$or'].push({
                    _id: query_id
                });
            }
            Sticker.findOne(query).populate({
                path: 'tags',
                select: 'name'
            }).populate({
                path: 'author',
                select: 'name'
            }).populate({
                path: 'pack',
                select: 'name'
            }).exec(function (err, sticker) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (sticker) {
                        done(false, {
                            message: 'Sticker found',
                            sticker: sticker
                        });
                    } else {
                        done(false, {
                            message: 'No sticker found',
                            sticker: sticker
                        });
                    }
                }
            });
        }
    },
    {
        path: '/stickers',
        method: 'GET',
        handler: function (req, done) {
            var query = {};
            var tasks = [];
            if (req.query.tag) {
                tasks.push(function (callback) {
                    Tag.findOne({
                        name: {
                            $regex: new RegExp('^' + req.query.tag + '$', 'i')
                        }
                    }).exec(function (err, tag) {
                        if (err) {
                            callback({
                                error: err
                            });
                        } else {
                            if (tag) {
                                query.tags = tag._id;
                                callback(null);
                            } else {
                                callback({
                                    error: false
                                });
                            }
                        }
                    });
                });
            }
            async.series(tasks, function (err, results) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (results && results.length) {
                        if (results[0].error) {
                            done(true, {
                                message: results[0].error.message
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
                            }
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
                        }).sort(sort).limit(count).skip(page * count).exec(function (err, stickers) {
                            if (err) {
                                done(true, {
                                    message: err.message
                                });
                            } else {
                                if (stickers) {
                                    // We don't count trending searches as hits
                                    // because that would continue to reinforce the top searches
                                    if (!req.query.type || req.query.type !== 'trending') {
                                        stickers.forEach(function (sticker) {
                                            sticker.hits.total += 1;
                                            sticker.hits.daily += 1;
                                            sticker.hits.weekly += 1;
                                            sticker.hits.monthly += 1;
                                            sticker.save(function (err, sticker) {

                                            });
                                        });
                                    }
                                    done(false, {
                                        message: 'Stickers found',
                                        stickers: stickers
                                    });
                                } else {
                                    done(false, {
                                        message: 'No stickers found',
                                        stickers: []
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    },
    {
        path: '/stickers',
        method: 'POST',
        handler: function (req, done) {

        }
    },
    {
        path: '/sticker/:id',
        method: 'PUT',
        handler: function (req, done) {

        }
    }
]
