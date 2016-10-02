var mongoose = require('mongoose');
var async = require('async');
var Tag = mongoose.model('Tag');
var levenshtein = require('fast-levenshtein');
var metaphone = require('metaphone');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = {
    getTag: {
        path: '/tag/:id',
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
            Tag.findOne(query).populate({
                path: 'stickers',
                select: 'name image'
            }).exec(function(err, tag) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (tag) ? 'Tag found' : 'No tag found',
                        tag: tag
                    });
                }
            });
        }
    },
    getTags: {
        path: '/tags',
        method: 'GET',
        handler: function(req, done) {
            var sort = {};
            if (req.query.type) {
                if (req.query.type === 'trending') {
                    sort = {
                        'hits.daily': -1,
                        'hits.weekly': -1,
                        'hits.monthly': -1,
                        'hits.total': -1
                    };
                }
                if (req.query.type === 'new') {
                    sort = {
                        'createdAt': -1,
                        'updatedAt': -1
                    };
                }
                if (req.query.type === 'recent') {
                    sort = {
                        'updatedAt': -1,
                        'createdAt': -1
                    };
                }
            }
            var page = req.query.page ? req.query.page : 1;
            if (page < 1) {
                done(true, {
                    message: 'Invalid page. Pagination starts at 1.'
                });
                return;
            }
            var count = req.query.count ? req.query.count : 20;

            if (isNaN(page)) {
                done(true, {
                    message: 'Invalid page.'
                });
                return;
            } else {
                page = parseInt(page, 10);
            }

            if (isNaN(count)) {
                done(true, {
                    message: 'Invalid count.'
                });
                return;
            } else {
                count = parseInt(count, 10);
            }

            var query = {};
            if (req.query.contains) {
                req.query.contains = req.query.contains.replaceAll('_', ' ');
                var tag_ids = {};
                var tags = [];
                var subcalls = [];
                var variations = {
                    $or: []
                };
                for (var i = 0; i < req.query.contains.length - 1; i++) {
                    variations.$or.push({
                        name: new RegExp(req.query.contains.slice(i, i + 2) + '\\w+', 'i')
                    });
                }
                if (variations.$or.length === 0) {
                    variations = {
                        name: new RegExp('\\b' + req.query.contains + '\\w+', 'i')
                    };
                }
                subcalls.push(function(callback) {
                    Tag.find(variations).populate({
                        path: 'stickers',
                        select: 'image animated'
                    }).exec(function (err, all_tags) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            all_tags.forEach(function (tag) {
                                var keywords = tag.name.split(' ');
                                if (keywords.length > 1) {
                                    keywords.push(tag.name);
                                }
                                var tag_score = -1;
                                for (var i in keywords) {
                                    var keyword = keywords[i];
                                    var phoentic_score = levenshtein.get(metaphone(req.query.contains), metaphone(keyword));
                                    var raw_score = levenshtein.get(req.query.contains.toLowerCase(), keyword.toLowerCase());
                                    var score = phoentic_score + raw_score * 0.75;
                                    if (score < 1 + req.query.contains.length / 5) {
                                        tag_score = score;
                                        break;
                                    }
                                }
                                if (tag_score > -1) {
                                    var tag_id = tag._id.toString();
                                    if (!(tag_id in tag_ids)) {
                                        tags.push(tag);
                                        tag_ids[tag_id] = tag_score;
                                    }
                                    else if (tag_score < tag_ids[tag_id]) {
                                        tag_ids[tag_id] = tag_score;
                                    }
                                }
                            });
                            callback(null);
                        }
                    });
                });
                async.series(subcalls, function (err, results) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    } else if (!(tags && tags.length)) {
                        done(false, {
                            message: 'Tags not found',
                            tags: []
                        });
                    }
                    else {
                        tags.sort(function (atag, btag) {
                            return tag_ids[atag._id.toString()] - tag_ids[btag._id.toString()];
                        });
                        var sliceBegin = (page - 1) * count;
                        var sliceEnd = page * count;
                        if (sliceBegin >= tags.length) {
                            tags = [];
                        } else if (sliceEnd > tags.length) {
                            tags = tags.slice(sliceBegin, tags.length);
                        } else {
                            tags = tags.slice(sliceBegin, sliceEnd);
                        }
                        done(false, {
                            message: tags.length ? 'Tags found' : 'Tags not found',
                            tags: tags
                        });
                    }
                });
            }
            else {
                Tag.find(query).populate({
                    path: 'stickers',
                    select: 'name image'
                }).sort(sort).limit(count).skip((page - 1) * count).exec(function(err, tags) {
                    if (err) {
                        done(true, {
                            message: err.message
                        });
                    } else {
                        done(false, {
                            message: (tags && tags.length) ? 'Tags found' : 'No tags found',
                            tags: tags
                        });
                    }
                });
            }
        }
    }
};
