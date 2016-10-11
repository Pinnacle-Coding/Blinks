var mongoose = require('mongoose');
var async = require('async');
var client = require(require('path').join(__base, 'app-s3.js'));
var Sticker = mongoose.model('Sticker');
var Tag = mongoose.model('Tag');
var Pack = mongoose.model('Pack');
var Author = mongoose.model('Author');
var s3 = require('s3');
var path = require('path');
var TagCtrl = require(path.join(__base, 'controllers/tags.js'));

// Use only with arrays of a SINGLE, PRIMITIVE type
// e.g. [String] or [int]
var uniq = function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = {
    onUseSticker: {
        path: '/use-sticker/:id',
        method: 'PUT',
        handler: function(req, done) {
            var query_id = req.params.id;
            var query = {
                _id: query_id
            };
            Sticker.findOne(query).populate({
                path: 'tags',
                select: 'hits'
            }).populate({
                path: 'author',
                select: 'hits'
            }).populate({
                path: 'pack',
                select: 'hits'
            }).exec(function(err, sticker) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                } else {
                    sticker.hits.counts[sticker.hits.counts.length - 1] += 1;
                    sticker.hits.score = 0;
                    for (var i = 0; i < sticker.hits.counts.length; i++) {
                        sticker.hits.score += (i + 1) * sticker.hits.counts[i];
                    }
                    sticker.noUpdate = true;
                    sticker.save(function(err, sticker) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        } else {
                            var author = sticker.author;
                            author.hits.counts[author.hits.counts.length - 1] += 1;
                            author.hits.score = 0;
                            for (var i = 0; i < author.hits.counts.length; i++) {
                                author.hits.score += (i + 1) * author.hits.counts[i];
                            }
                            author.noUpdate = true;
                            author.save(function(err, author) {
                                if (err) {
                                    done(err, {
                                        message: err.message
                                    });
                                } else {
                                    var pack = sticker.pack;
                                    pack.hits.counts[pack.hits.counts.length - 1] += 1;
                                    pack.hits.score = 0;
                                    for (var i = 0; i < pack.hits.counts.length; i++) {
                                        pack.hits.score += (i + 1) * pack.hits.counts[i];
                                    }
                                    pack.noUpdate = true;
                                    pack.save(function(err, pack) {
                                        if (err) {
                                            done(err, {
                                                message: err.message
                                            });
                                        } else {
                                            var calls = [];
                                            sticker.tags.forEach(function(tag) {
                                                calls.push(function(callback) {
                                                    tag.hits.counts[tag.hits.counts.length - 1] += 1;
                                                    tag.hits.score = 0;
                                                    for (var i = 0; i < tag.hits.counts.length; i++) {
                                                        tag.hits.score += (i + 1) * tag.hits.counts[i];
                                                    }
                                                    tag.noUpdate = true;
                                                    tag.save(function(err, tag) {
                                                        callback(null);
                                                    });
                                                });
                                            });
                                            async.parallel(calls, function(err, results) {
                                                if (err) {
                                                    done(err, {
                                                        message: err.message
                                                    });
                                                } else {
                                                    Sticker.findOne({
                                                        _id: sticker._id
                                                    }).populate({
                                                        path: 'tags',
                                                        select: 'name hits'
                                                    }).populate({
                                                        path: 'author',
                                                        select: 'name location image hits'
                                                    }).populate({
                                                        path: 'pack',
                                                        select: 'name hits'
                                                    }).exec(function(err, sticker) {
                                                        if (err) {
                                                            done(true, {
                                                                message: err.message
                                                            });
                                                        } else {
                                                            done(false, {
                                                                message: (sticker) ? 'Sticker found' : 'No sticker found',
                                                                sticker: sticker
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
                    });
                }
            });
        }
    },
    getSticker: {
        path: '/sticker/:id',
        method: 'GET',
        handler: function(req, done) {
            var query_id = req.params.id;
            var query = {
                _id: query_id
            };
            Sticker.findOne(query).populate({
                path: 'tags',
                select: 'name'
            }).populate({
                path: 'author',
                select: 'name location image hits'
            }).populate({
                path: 'pack',
                select: 'name hits'
            }).exec(function(err, sticker) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (sticker) ? 'Sticker found' : 'No sticker found',
                        sticker: sticker
                    });
                }
            });
        }
    },
    getStickers: {
        path: '/stickers',
        method: 'GET',
        handler: function(req, done) {
            var sort = {};
            if (req.query.type) {
                if (req.query.type === 'trending') {
                    sort = {
                        'hits.score': -1
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

            if (req.query.tag) {
                req.query.tag = req.query.tag.replaceAll('_', ' ');
                var query_tag_split = req.query.tag.split(' ');
                var banned = false;
                query_tag_split.forEach(function (query_tag_word) {
                    banned = banned || ([
                        'ass',
                        'asshole',
                        'assholes',
                        'bastard',
                        'bastards',
                        'bitch',
                        'bitches',
                        'bitchy',
                        'bullshit',
                        'cock',
                        'cocks',
                        'crap',
                        'crappy',
                        'cum',
                        'cunt',
                        'cunts',
                        'dammit',
                        'damn',
                        'dick',
                        'dicks',
                        'fag',
                        'fags',
                        'faggot',
                        'faggots',
                        'fuck',
                        'fucks',
                        'fucked',
                        'fucker',
                        'fucking',
                        'goddamn',
                        'jackass',
                        'masturbate',
                        'masturbates',
                        'masturbating',
                        'masturbation',
                        'motherfucker',
                        'motherfuckers',
                        'motherfucking',
                        'nigger',
                        'niggers',
                        'penis',
                        'pussy',
                        'pussies',
                        'queer',
                        'queers',
                        'retard',
                        'retarded',
                        'retards',
                        'sex',
                        'sexual',
                        'shit',
                        'shits',
                        'shitty',
                        'slut',
                        'sluts',
                        'slutty',
                        'vag',
                        'vagina',
                        'vaginas',
                        'weiner',
                        'weiners',
                        'whore',
                        'whores'
                    ].indexOf(query_tag_word) !== -1);
                });
                if (banned) {
                    done (true, {
                        message: 'Search contained explicit terms.',
                        stickers: []
                    });
                    return;
                }
                req.query.contains = req.query.tag;
                req.query.page = 1;
                req.query.count = 20;
                TagCtrl.getTags.handler(req, function (err, results) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    }
                    else {
                        var tags = results.tags;
                        if (!(tags && tags.length)) {
                            done(false, {
                                message: 'Stickers not found',
                                stickers: []
                            });
                        } else {
                            var stickers = [];
                            var stickerIds = {};
                            tags.forEach(function(tag) {
                                tag.stickers.forEach(function (sticker) {
                                    var stringId = sticker._id.toString();
                                    if (!(stringId in stickerIds)) {
                                        stickerIds[stringId] = '';
                                        stickers.push(sticker);
                                    }
                                });
                            });
                            var sliceBegin = (page - 1) * count;
                            var sliceEnd = page * count;
                            if (sliceBegin >= stickers.length) {
                                stickers = [];
                            } else if (sliceEnd > stickers.length) {
                                stickers = stickers.slice(sliceBegin, stickers.length);
                            } else {
                                stickers = stickers.slice(sliceBegin, sliceEnd);
                            }
                            var stickersDone = [];
                            var tasks = [];
                            stickers.forEach(function(sticker) {
                                tasks.push(function(callback) {
                                    Sticker.findOne({
                                        _id: sticker._id
                                    }).populate({
                                        path: 'tags',
                                        select: 'name'
                                    }).populate({
                                        path: 'pack',
                                        select: 'name'
                                    }).populate({
                                        path: 'author',
                                        select: 'name location'
                                    }).exec(function(err, sticker) {
                                        stickersDone.push(sticker);
                                        callback(null);
                                    });
                                });
                            });
                            async.series(tasks, function(err, results) {
                                if (err) {
                                    done(true, {
                                        message: err.message
                                    });
                                } else {
                                    done(false, {
                                        message: stickersDone.length ? 'Stickers found' : 'Stickers not found',
                                        stickers: stickersDone
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                Sticker.find().populate({
                    path: 'tags',
                    select: 'name'
                }).populate({
                    path: 'author',
                    select: 'name location'
                }).populate({
                    path: 'pack',
                    select: 'name'
                }).sort(sort).limit(count).skip((page - 1) * count).exec(function(err, stickers) {
                    if (err) {
                        done(true, {
                            message: err.message
                        });
                    } else {
                        done(false, {
                            message: stickers.length ? 'Stickers found' : 'Stickers not found',
                            stickers: stickers
                        });
                    }
                });
            }
        }
    },
    createSticker: {
        path: '/stickers',
        method: 'POST',
        upload: 'sticker',
        handler: function(req, done) {
            if (req.body.pack && req.body.tags && req.file && req.body.password) {
                if (req.body.password !== __password) {
                    done(true, {
                        message: 'Incorrect password'
                    });
                    return;
                }
                var query = {
                    $or: [{
                        name: req.body.pack
                    }]
                };
                if (/^[0-9a-f]{24}$/.test(req.body.pack)) {
                    query.$or.push({
                        _id: req.body.pack
                    });
                }
                Pack.findOne(query).exec(function(err, pack) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    } else if (!pack) {
                        done(true, {
                            message: 'Pack does not exist'
                        });
                    } else {
                        var tags = [];
                        var tag_ids = [];
                        if (typeof req.body.tags === 'string') {
                            req.body.tags = req.body.tags.split(',');
                        }
                        var tag_strings = [];
                        uniq(req.body.tags).forEach(function(tag_string) {
                            tag_strings.push(tag_string.toLowerCase().trim());
                        });
                        var calls = [];
                        tag_strings.forEach(function(tag_string) {
                            calls.push(function(callback) {
                                Tag.findOne({
                                    name: tag_string
                                }).exec(function(err, tag) {
                                    if (!err) {
                                        if (tag) {
                                            tags.push(tag);
                                            tag_ids.push(tag._id);
                                            callback(null);
                                        } else {
                                            var new_tag = new Tag({
                                                name: tag_string,
                                                stickers: []
                                            });
                                            new_tag.save(function(err, new_tag) {
                                                if (!err) {
                                                    tags.push(new_tag);
                                                    tag_ids.push(new_tag._id);
                                                    callback(null);
                                                }
                                            });
                                        }
                                    }
                                });
                            });
                        });
                        async.parallel(calls, function(err, results) {
                            if (err) {
                                done(err, {
                                    message: err.message
                                });
                            } else {
                                var sticker = new Sticker({
                                    author: pack.author,
                                    pack: pack._id,
                                    tags: tag_ids
                                });
                                var key = require('path').join('stickers', sticker._id.toString());
                                var params = {
                                    localFile: req.file.path,
                                    s3Params: {
                                        Bucket: __bucket,
                                        Key: key
                                    }
                                };
                                var uploader = client.uploadFile(params);
                                uploader.on('error', function(err) {
                                    done(err, {
                                        message: err.message
                                    });
                                });
                                uploader.on('end', function() {
                                    sticker.s3 = s3.getPublicUrl(__bucket, key);
                                    if (__cloudfront) {
                                        sticker.image = sticker.s3.replace('s3.amazonaws.com/' + __bucket, __cloudfront + '.cloudfront.net');
                                    } else {
                                        sticker.image = sticker.s3;
                                    }
                                    var mimetype = req.file.mimetype;
                                    sticker.animated = (mimetype.indexOf('gif') !== -1 || mimetype.indexOf('apng') !== -1);
                                    sticker.save(function(err, sticker) {
                                        if (err) {
                                            done(err, {
                                                message: err.message
                                            });
                                        } else {
                                            var calls = [];
                                            tags.forEach(function(tag) {
                                                calls.push(function(callback) {
                                                    tag.stickers.push(sticker._id);
                                                    tag.save(function(err, tag) {
                                                        callback(null);
                                                    });
                                                });
                                            });
                                            async.parallel(calls, function(err, results) {
                                                if (err) {
                                                    done(err, {
                                                        message: err.message
                                                    });
                                                } else {
                                                    if (!pack.stickers || !pack.stickers.length) {
                                                        pack.stickers = [];
                                                    }
                                                    pack.stickers.push(sticker._id);
                                                    pack.save(function(err, pack) {
                                                        if (err) {
                                                            done(err, {
                                                                message: err.message
                                                            });
                                                        } else {
                                                            done(null, {
                                                                message: 'Sticker successfully created',
                                                                sticker: sticker
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            } else {
                done(true, {
                    message: 'Required parameters missing'
                });
            }
        }
    },
    updateSticker: {
        path: '/sticker/:id',
        method: 'PUT',
        upload: 'sticker',
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
            var query_id = req.params.id;
            Sticker.findOne({
                _id: query_id
            }).populate({
                path: 'tags',
                select: 'name stickers'
            }).exec(function(err, sticker) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                } else if (!sticker) {
                    done(true, {
                        message: 'Sticker not found'
                    });
                } else {
                    var calls = [];
                    if (req.body.pack) {
                        calls.push(function(callback) {
                            Pack.findOne({
                                _id: sticker.pack
                            }).exec(function(err, old_pack) {
                                if (err) {
                                    callback(err);
                                } else {
                                    old_pack.stickers.pull(sticker._id);
                                    old_pack.save(function(err, old_pack) {
                                        var query = {
                                            $or: [{
                                                name: req.body.pack
                                            }]
                                        };
                                        if (/^[0-9a-f]{24}$/.test(req.body.pack)) {
                                            query.$or.push({
                                                _id: req.body.pack
                                            });
                                        }
                                        Pack.findOne(query).exec(function(err, pack) {
                                            if (err) {
                                                callback(err);
                                            } else if (pack) {
                                                sticker.pack = pack._id;
                                                pack.stickers.push(sticker._id);
                                                pack.save(function(err, pack) {
                                                    callback(null);
                                                });
                                            } else {
                                                callback(null);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                    if (req.body.tags) {
                        calls.push(function(callback) {
                            var subcalls = [];
                            sticker.tags.forEach(function(tag) {
                                subcalls.push(function(callback) {
                                    tag.stickers.pull(sticker._id);
                                    tag.save(function(err, tag) {
                                        callback(null);
                                    });
                                });
                            });
                            async.series(subcalls, function(err, results) {
                                if (err) {
                                    callback(err);
                                } else {
                                    sticker.tags = [];
                                    if (typeof req.body.tags === 'string') {
                                        req.body.tags = req.body.tags.split(',');
                                    }
                                    var tag_ids = [];
                                    var tag_names = [];
                                    uniq(req.body.tags).forEach(function(tag_name) {
                                        tag_names.push(tag_name.toLowerCase().trim());
                                    });
                                    subcalls = [];
                                    tag_names.forEach(function(tag_name) {
                                        subcalls.push(function(callback) {
                                            Tag.findOne({
                                                name: tag_name
                                            }).exec(function(err, tag) {
                                                if (err) {
                                                    callback(err);
                                                } else if (!tag) {
                                                    tag = new Tag({
                                                        name: tag_name
                                                    });
                                                }
                                                tag.save(function(err, tag) {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        tag.stickers.push(sticker._id);
                                                        tag_ids.push(tag._id);
                                                        callback(null);
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    async.series(subcalls, function(err, results) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            sticker.tags = tag_ids;
                                            callback(null);
                                        }
                                    });
                                }
                            });
                        });
                    }
                    if (req.file) {
                        calls.push(function(callback) {
                            var key = require('path').join('stickers', sticker._id.toString());
                            var params = {
                                Bucket: __bucket,
                                Delete: {
                                    Objects: [{
                                        Key: key
                                    }]
                                }
                            };
                            var deleter = client.deleteObjects(params);
                            deleter.on('error', function(err) {
                                callback(err);
                            });
                            deleter.on('end', function() {
                                params = {
                                    localFile: req.file.path,
                                    s3Params: {
                                        Bucket: __bucket,
                                        Key: key
                                    }
                                };
                                var uploader = client.uploadFile(params);
                                uploader.on('error', function(err) {
                                    callback(err);
                                });
                                uploader.on('end', function() {
                                    callback(null);
                                });
                            });
                        });
                    }
                    async.series(calls, function(err, results) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        } else {
                            sticker.save(function(err, sticker) {
                                Sticker.findOne({
                                    _id: sticker._id
                                }).populate({
                                    path: 'tags',
                                    select: 'name'
                                }).populate({
                                    path: 'author',
                                    select: 'name location image'
                                }).populate({
                                    path: 'pack',
                                    select: 'name'
                                }).exec(function(err, sticker) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        done(false, {
                                            message: 'Sticker updated successfully',
                                            sticker: sticker
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    },
    deleteSticker: {
        path: '/sticker/:id',
        method: 'DELETE',
        handler: function(req, done) {
            if (req.body.password) {
                if (req.body.password === __password) {
                    Sticker.findOne({
                        _id: req.params.id
                    }).exec(function(err, sticker) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        } else if (!sticker) {
                            done(true, {
                                message: 'Sticker does not exist'
                            });
                        } else {
                            var key = require('path').join('stickers', sticker._id.toString());
                            var params = {
                                Bucket: __bucket,
                                Delete: {
                                    Objects: [{
                                        Key: key
                                    }]
                                }
                            };
                            var deleter = client.deleteObjects(params);
                            deleter.on('error', function(err) {
                                done(err, {
                                    message: err.message
                                });
                            });
                            deleter.on('end', function() {
                                sticker.remove(function(err) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        done(false, {
                                            message: 'Sticker deleted successfully'
                                        });
                                    }
                                });
                            });
                        }
                    });
                } else {
                    done(true, {
                        message: 'Incorrect password'
                    });
                }
            } else {
                done(true, {
                    message: 'Required parameters missing'
                });
            }
        }
    }
};
