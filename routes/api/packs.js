var mongoose = require('mongoose');
var Pack = mongoose.model('Pack');

module.exports = [
    {
        path: '/pack/:id',
        method: 'GET',
        handler: function (req, done) {
            var query_id = req.params.id;
            var query = {
                $or: [
                    {
                        name: query_id
                    }
                ]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query.$or.push({
                    _id: query_id
                });
            }
            Pack.findOne(query).populate({
                path: 'stickers',
                select: 'name image'
            }).populate({
                path: 'author',
                select: 'name location image'
            }).exec(function (err, pack) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (pack) {
                        pack.hits.total += 1;
                        pack.hits.daily += 1;
                        pack.hits.weekly += 1;
                        pack.hits.monthly += 1;
                        pack.save(function (err, sticker) {

                        });
                    }
                    done(false, {
                        message: (sticker) ? 'Pack found' : 'No pack found',
                        pack: pack
                    });
                }
            });
        }
    },
    {
        path: '/packs',
        method: 'GET',
        handler: function (req, done) {
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
            Pack.find().sort(sort).limit(count).skip(page * count).exec(function (err, packs) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                }
                else {
                    if (packs && packs.length) {
                        if (!req.query.type || req.query.type !== 'trending') {
                            packs.forEach(function (pack) {
                                pack.hits.daily += 1;
                                pack.hits.weekly += 1;
                                pack.hits.monthly += 1;
                                pack.hits.total += 1;
                                pack.save(function (err, pack) {

                                });
                            });
                        }
                    }
                    done(false, {
                        message: (packs && packs.length) ? 'Packs found' : 'No packs found',
                        packs: packs
                    });
                }
            });
        }
    },
    {
        path: '/packs',
        method: 'POST',
        handler: function (req, done) {

        }
    },
    {
        path: '/pack/:id',
        method: 'PUT',
        handler: function (req, done) {

        }
    }
];
