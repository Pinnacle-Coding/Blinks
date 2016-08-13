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
            var tag_error = undefined;
            if (req.query.tag) {
                tasks.push(function (callback) {
                    Tag.findOne({
                        name: {
                            $regex: new RegExp('^' + req.query.tag + '$', 'i')
                        }
                    }).exec(function (err, tag) {
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
            async.series(tasks, function (err, results) {
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
                                if (stickers && stickers.length) {
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
