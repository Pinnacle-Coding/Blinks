var mongoose = require('mongoose');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
var StickerCtrl = require(require('path').join(__base, 'controllers/stickers.js'));

module.exports = {
    getPack: {
        path: '/pack/:id',
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
            Pack.findOne(query).populate({
                path: 'stickers',
                select: 'name image updatedAtTimestamp createdAtTimestamp'
            }).populate({
                path: 'author',
                select: 'name location image'
            }).exec(function(err, pack) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (pack) ? 'Pack found' : 'No pack found',
                        pack: pack
                    });
                }
            });
        }
    },
    getPacks: {
        path: '/packs',
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
            Pack.find().populate({
                path: 'stickers',
                select: 'name image updatedAtTimestamp createdAtTimestamp'
            }).populate({
                path: 'author',
                select: 'name location image'
            }).sort(sort).limit(count).skip((page - 1) * count).exec(function(err, packs) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (packs && packs.length) ? 'Packs found' : 'No packs found',
                        packs: packs
                    });
                }
            });
        }
    },
    createPack: {
        path: '/packs',
        method: 'POST',
        handler: function(req, done) {
            if (req.body.author && req.body.name && req.body.password) {
                if (req.body.password !== __password) {
                    done(true, {
                        message: 'Incorrect password'
                    });
                    return;
                }
                var author_id = req.body.author;
                var author_query = {
                    $or: [{
                        username: author_id
                    }]
                };
                if (/^[0-9a-f]{24}$/.test(author_id)) {
                    author_query.$or.push({
                        _id: author_id
                    });
                }
                Author.findOne(author_query).exec(function(err, author) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    } else if (!author) {
                        done(true, {
                            message: 'Author does not exist'
                        });
                    } else {
                        Pack.findOne({
                            name: req.body.name
                        }).exec(function(err, pack) {
                            if (err) {
                                done(err, {
                                    message: err.message
                                });
                            } else if (pack) {
                                done(true, {
                                    message: 'Pack by that name already exists'
                                });
                            } else {
                                var new_pack = new Pack({
                                    name: req.body.name,
                                    author: author._id,
                                    stickers: [],
                                    createdAtTimestamp: new Date().getTime()
                                });
                                new_pack.save(function(err, pack) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        author.packs.push(pack._id);
                                        author.save(function(err, author) {
                                            if (err) {
                                                done(err, {
                                                    message: err.message
                                                });
                                            } else {
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
            } else {
                done(true, {
                    message: 'Missing required parameters'
                });
            }
        }
    },
    updatePack: {
        path: '/pack/:id',
        method: 'PUT',
        handler: function(req, done) {
            done(null, {
                message: 'Not implemented'
            });
        }
    },
    deletePack: {
        path: '/pack/:id',
        method: 'DELETE',
        handler: function(req, done) {
            if (!req.body.password) {
                done(true, {
                    message: 'Required parameters missing'
                });
                return;
            }
            if (req.body.password !== __password) {
                done(true, {
                    message: 'Incorrect password'
                });
                return;
            }
            var query_id = req.query.id;
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
            Pack.findOne(query).populate({
                path: 'author',
                select: 'packs'
            }).exec(function(err, pack) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                } else if (!pack) {
                    done(true, {
                        message: 'Pack by that id does not exist'
                    });
                } else {
                    var calls = [];
                    pack.stickers.forEach(function(sticker) {
                        calls.push(function(callback) {
                            req.params.id = sticker;
                            StickerCtrl.deleteSticker.handler(req, function(err, res) {
                                callback(err ? err : null);
                            });
                        });
                    });
                    async.parallel(calls, function() {
                        pack.author.packs.pull(pack._id);
                        pack.author.save(function(err) {
                            if (err) {
                                done(err, {
                                    message: err.message
                                });
                            } else {
                                pack.remove(function(err) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        done(false, {
                                            message: 'Pack deleted successfully'
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    }
};
