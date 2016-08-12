var mongoose = require('mongoose');
var Sticker = mongoose.model('Sticker');

module.exports = [
    {
        path: '/sticker/:id',
        method: 'GET',
        handler: function (req, done) {
            var query_id = req.params.id
            var query = {
                name: query_id
            };
            if (mongoose.ObjectId.isValid(query_id)) {
                query = {
                    _id: query_id
                }
            }
            Sticker.findOne(query).exec(function (err, sticker) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                }
                else {
                    done(false, {
                        message: 'Successfully retrieved sticker',
                        sticker: sticker
                    });
                }
            });
        }
    }
]
