var mongoose = require('mongoose');
var async = require('async');
var client = require(require('path').join(__base, 'app-s3.js'));
var PackCtrl = require(require('path').join(__base, 'controllers/packs.js'));
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
                    username: query_id
                }]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query.$or.push({
                    _id: query_id
                });
            }
            var sort = {};
            if (req.query.type) {
                if (req.query.type === 'trending') {
                    sort = {
                        'hits.trending': -1
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
            Author.findOne(query).populate({
                path: 'packs',
                select: 'name'
            }).sort(sort).exec(function(err, author) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else {
                    done(false, {
                        message: (author) ? 'Author found' : 'No author found',
                        author: author
                    });
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
                            packs: []
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
                                    new_author.s3 = s3.getPublicUrl(__bucket, key);
                                    if (__cloudfront) {
                                        new_author.image = new_author.s3.replace('s3.amazonaws.com/' + __bucket, __cloudfront + '.cloudfront.net');
                                    } else {
                                        new_author.image = new_author.s3;
                                    }
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
        upload: 'avatar',
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
            var query = {
                $or: [{
                    username: query_id
                }]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query.$or.push({
                    _id: query_id
                });
            }
            Author.findOne(query).exec(function(err, author) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                } else if (!author) {
                    done(true, {
                        message: 'Author not found'
                    });
                } else {
                    var calls = [];
                    if (req.body.name) {
                        calls.push(function(callback) {
                            if (req.body.name === '') {
                                req.body.name = 'Anonymous Artist';
                            }
                            author.name = req.body.name;
                            callback(null);
                        });
                    }
                    if (req.body.location !== undefined) {
                        calls.push(function(callback) {
                            author.location = req.body.location;
                            callback(null);
                        });
                    }
                    if (req.file) {
                        calls.push(function(callback) {
                            var key = require('path').join('authors', author._id.toString());
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
                                    author.s3 = s3.getPublicUrl(__bucket, key);
                                    if (__cloudfront) {
                                        author.image = author.s3.replace('s3.amazonaws.com/' + __bucket, __cloudfront + '.cloudfront.net');
                                    } else {
                                        author.image = author.s3;
                                    }
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
                            author.save(function(err, author) {
                                Author.findOne({
                                    _id: author._id
                                }).populate({
                                    path: 'packs',
                                    select: 'name'
                                }).exec(function(err, author) {
                                    if (err) {
                                        done(err, {
                                            message: err.message
                                        });
                                    } else {
                                        done(false, {
                                            message: 'Author updated successfully',
                                            author: author
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
    deleteAuthor: {
        path: '/author/:id',
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
            var query_id = req.params.id;
            var query = {
                $or: [{
                    username: query_id
                }]
            };
            if (/^[0-9a-f]{24}$/.test(query_id)) {
                query.$or.push({
                    _id: query_id
                });
            }
            Author.findOne(query).exec(function(err, author) {
                if (err) {
                    done(true, {
                        message: err.message
                    });
                } else if (!author) {
                    done(true, {
                        message: 'Author not found'
                    });
                } else {
                    var calls = [];
                    author.packs.forEach(function(pack) {
                        calls.push(function(callback) {
                            req.params.id = pack;
                            PackCtrl.deletePack.handler(req, function(err, res) {
                                callback(err ? err : null);
                            });
                        });
                    });
                    async.series(calls, function(err, results) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        } else {
                            author.remove(function(err) {
                                done(false, {
                                    message: 'Author deleted successfully'
                                });
                            });
                        }
                    });
                }
            });
        }
    }
};
