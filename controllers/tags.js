var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

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
            var query = {};
            if (req.query.contains) {
                req.query.contains = req.query.contains.replaceAll('_', ' ');
                query = {
                    $or: [{
                        name: new RegExp('\\b' + req.query.contains + '\\w+', 'i')
                    }, {
                        name: new RegExp(req.query.contains, 'i')
                    }]
                };
            }
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
};
