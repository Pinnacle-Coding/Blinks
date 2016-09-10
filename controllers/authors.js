var mongoose = require('mongoose');
var async = require('async');
var client = require(require('path').join(__base, 'app-s3.js'));
var Author = mongoose.model('Author');
var s3 = require('s3');

module.exports = {
    getAuthor: {
        path: '/author/:id',
        method: 'GET',
        handler: function(req, done) {
            var query_id = req.params.id;
            var query = {
                $or: [{
                    name: query_id
                }, {
                    username: query_id
                }]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query.$or.push({
                    _id: query_id
                });
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
            Author.findOne(query).populate({
                path: 'packs',
                select: 'name'
            }).sort(sort).exec(function(err, author) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    if (author && !req.query.hitblock) {
                        author.hits.total += 1;
                        author.hits.daily += 1;
                        author.hits.weekly += 1;
                        author.hits.monthly += 1;
                        author.save(function(err, author) {
                            if (err) {
                                done(true, {
                                    message: err.message
                                });
                            } else {
                                done(false, {
                                    message: 'Author found',
                                    author: author
                                });
                            }
                        });
                    } else {
                        done(false, {
                            message: (author) ? 'Author found' : 'No author found',
                            author: author
                        });
                    }
                }
            });
        }
    },
    getAuthors: {
        path: '/authors',
        method: 'GET',
        handler: function(req, done) {
            var page = req.query.page ? req.query.page : 1;
            if (page < 1) {
                done(true, {
                    message: 'Invalid page. Pagination starts at 1.'
                });
                return;
            }
            var count = req.query.count ? req.query.count : 20;
            Author.find().populate({
                path: 'packs',
                select: 'name'
            }).limit(count).skip((page - 1) * count).exec(function(err, authors) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (authors && authors.length) ? 'Authors found' : 'No authors found',
                        authors: authors
                    });
                }
            });
        }
    },
    createAuthor: {
        path: '/authors',
        method: 'POST',
        upload: 'avatar',
        handler: function(req, done) {
            if (req.body.username && req.body.name && req.body.password) {
                if (req.body.password !== __password) {
                    done(true, {
                        message: 'Incorrect password'
                    });
                    return;
                }
                var username = req.body.username;
                var name = req.body.name;
                var query = {
                    username: username
                };
                Author.findOne(query).exec(function(err, author) {
                    if (err) {
                        done(err, {
                            message: err.message
                        });
                    } else if (author) {
                        done(true, {
                            message: 'Author already exists by that name or username'
                        });
                    } else {
                        var new_author = new Author({
                            name: name,
                            username: username,
                            location: (req.body.location) ? req.body.location : undefined,
                            packs: [],
                            hits: {
                                daily: 0,
                                weekly: 0,
                                monthly: 0,
                                total: 0
                            }
                        });
                        var calls = [];
                        calls.push(function(callback) {
                            if (req.file) {
                                var key = require('path').join('authors', new_author._id.toString());
                                var params = {
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
                                    new_author.image = s3.getPublicUrl(__bucket, key);
                                    callback();
                                });
                            } else {
                                callback();
                            }
                        });
                        async.series(calls, function(err) {
                            if (err) {
                                done(true, {
                                    message: err.message
                                });
                            } else {
                                new_author.save(function(err, new_author) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        done(null, {
                                            message: 'Author successfully created',
                                            author: new_author
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                done(null, {
                    message: 'Required parameters not found'
                });
            }
        }
    },
    updateAuthor: {
        path: '/author/:id',
        method: 'PUT',
        handler: function(req, done) {
            done(null, {
                message: 'Not implemented'
            });
        }
    }
};
