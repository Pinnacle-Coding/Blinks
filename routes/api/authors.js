var mongoose = require('mongoose');
var async = require('async');
var Author = mongoose.model('Author');
var client = require(__base + 's3client.js');

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
                        if (req.files.avatar) {
                            var filename = req.files.avatar;
                            var bucket = 'blinks-authors';
                            var key = new_author._id;
                            var params = {
                                localFile: filename,
                                s3Params: {
                                    Bucket: bucket,
                                    Key: key
                                }
                            };
                            var uploader = client.uploadFile(params);
                            uploader.on('error', function(err) {
                                callback(err);
                            });
                            uploader.on('end', function () {
                                callback();
                            });
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
