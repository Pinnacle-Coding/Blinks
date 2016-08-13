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
                    name: new RegExp('\\b'+req.query.contains+'\\w+', 'i')
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
            Tag.find(query).sort(sort).limit(20).skip(0).exec(function (err, tags) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                }
                else {
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
