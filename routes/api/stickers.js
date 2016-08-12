var mongoose = require('mongoose');
var Sticker = mongoose.model('Sticker');

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
            Sticker.findOne(query).exec(function (err, sticker) {
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
