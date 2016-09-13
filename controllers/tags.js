var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

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
                    if (tag && !req.query.hitblock) {
                        tag.hits.total += 1;
                        tag.hits.daily += 1;
                        tag.hits.weekly += 1;
                        tag.hits.monthly += 1;
                        tag.save(function(err, sticker) {

                        });
                    }
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
            var query = {};
            if (req.query.contains) {
                query = {
                    $or: [{
                        name: new RegExp('\\b' + req.query.contains + '\\w+', 'i')
                    }, {
                        name: new RegExp(req.query.contains, 'i')
                    }]
                };
            }
            var sort = {};
            if (req.query.type && req.query.type === 'trending') {
                sort = {
                    'hits.daily': -1,
                    'hits.weekly': -1,
                    'hits.monthly': -1,
                    'hits.total': -1
                };
            }
            var page = req.query.page ? req.query.page : 1;
            if (page < 1) {
                done(true, {
                    message: 'Invalid page. Pagination starts at 1.'
                });
                return;
            }
            var count = req.query.count ? req.query.count : 20;
            Tag.find(query).populate({
                path: 'stickers',
                select: 'name image'
            }).sort(sort).limit(count).skip((page - 1) * count).exec(function(err, tags) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (tags && tags.length) {
                        if (!req.query.type || req.query.type !== 'trending') {
                            tags.forEach(function(tag) {
                                tag.hits.daily += 1;
                                tag.hits.weekly += 1;
                                tag.hits.monthly += 1;
                                tag.hits.total += 1;
                                tag.save(function(err, tag) {

                                });
                            });
                        }
                    }
                    done(false, {
                        message: (tags && tags.length) ? 'Tags found' : 'No tags found',
                        tags: tags
                    });
                }
            });
        }
    }
};
