var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

module.exports = [
    {
        path: '/tag/:id',
        method: 'GET',
        handler: function (req, done) {

        }
    },
    {
        path: '/tags',
        method: 'GET',
        handler: function (req, done) {
            var query = {};
            if (req.query.contains) {
                query = {
                    name: new RegExp('\\b' + req.query.contains + '\\w+', 'i')
                }
            }
            var sort = {};
            if (req.query.type && req.query.type === 'trending') {
                sort = {
                    'hits.daily': -1,
                    'hits.weekly': -1,
                    'hits.monthly': -1,
                    'hits.total': -1
                }
            }
            Tag.find(query).populate({
                path: 'stickers',
                select: 'name image'
            }).sort(sort).limit(20).skip(0).exec(function (err, tags) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (tags && tags.length) {
                        if (!req.query.type || req.query.type !== 'trending') {
                            tags.forEach(function (tag) {
                                tag.hits.daily += 1;
                                tag.hits.weekly += 1;
                                tag.hits.monthly += 1;
                                tag.hits.total += 1;
                                tag.save(function (err, tag) {

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
    },
    {
        path: '/tags',
        method: 'POST',
        handler: function (req, done) {

        }
    },
    {
        path: '/tag/:id',
        method: 'PUT',
        handler: function (req, done) {

        }
    }
]
