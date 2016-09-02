var mongoose = require('mongoose');
var async = require('async');
var client = require(require('path').join(__base, 'app-s3.js'));
var Author = mongoose.model('Author');
var s3 = require('s3');

module.exports = [{
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
        Author.findOne(query).populate({
            path: 'packs',
            select: 'name'
        }).exec(function(err, author) {
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
}, {
    path: '/authors',
    method: 'GET',
    handler: function(req, done) {
        done(null, {
            message: 'Not implemented'
        });
    }
}, {
    path: '/authors',
    method: 'POST',
    upload: 'avatar',
    handler: function(req, done) {
        if (req.body.username && req.body.name) {
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
                            var extension = req.file.path.split('.').pop();
                            var key = require('path').join('authors', new_author._id.toString() + '.' + extension);
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
                            uploader.on('end', function () {
                                new_author.image = s3.getPublicUrl(__bucket, key);
                                callback();
                            });
                        }
                        else {
                            callback();
                        }
                    });
                    async.series(calls, function (err) {
                        if (err) {
                            done(true, {
                                message: err.message
                            });
                        }
                        else {
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
}, {
    path: '/author/:id',
    method: 'PUT',
    handler: function(req, done) {
        done(null, {
            message: 'Not implemented'
        });
    }
}];
