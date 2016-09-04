var mongoose = require('mongoose');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');

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
            var page = req.query.page ? req.query.page : 1;
            if (page < 1) {
                page = 1;
            }
            var count = req.query.count ? req.query.count : 20;
            Pack.find().populate({
                path: 'stickers',
                select: 'name image'
            }).populate({
                path: 'author',
                select: 'name location image'
            }).sort(sort).limit(count).skip((page - 1) * count).exec(function (err, packs) {
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
            if (req.body.author && req.body.name) {
                var author_id = req.body.author;
                var author_query = {
                    $or: [
                        {
                            username: author_id
                        }
                    ]
                };
                if (/^[0-9a-f]{24}$/.test(author_id)) {
                    author_query.$or.push({
                        _id: author_id
                    });
                }
                Author.findOne(author_query).exec(function (err, author) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    }
                    else if (!author) {
                        done(true, {
                            message: 'Author does not exist'
                        });
                    }
                    else {
                        Pack.findOne({
                            name: req.body.name
                        }).exec(function (err, pack) {
                            if (err) {
                                done(err, {
                                    message: err.message
                                });
                            }
                            else if (pack) {
                                done(true, {
                                    message: 'Pack by that name already exists'
                                });
                            }
                            else {
                                var new_pack = new Pack({
                                    name: req.body.name,
                                    author: author._id,
                                    stickers: [],
                                    hits: {
                                        daily: 0,
                                        weekly: 0,
                                        monthly: 0,
                                        total: 0
                                    }
                                });
                                new_pack.save(function (err, pack) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    }
                                    else {
                                        author.packs.push(pack._id);
                                        author.save(function (err, author) {
                                            if (err) {
                                                done(err, {
                                                    message: err.message
                                                });
                                            }
                                            else {
                                                done(null, {
                                                    message: 'Pack successfully created',
                                                    pack: pack
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                done(true, {
                    message: 'Missing required parameters'
                });
            }
        }
    },
    {
        path: '/pack/:id',
        method: 'PUT',
        handler: function (req, done) {
            done(null, {
                message: 'Not implemented'
            });
        }
    }
];
