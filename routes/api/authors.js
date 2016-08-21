var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Author = mongoose.model('Author');

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
        done(null, {});
    }
}, {
    path: '/authors',
    method: 'POST',
    handler: function(req, done) {
        if (req.body.username && req.body.password && req.body.name) {
            var username = req.body.username;
            var password = req.body.password;
            var name = req.body.name;
            var query = {
                username: username
            };
            Author.findOne(query).exec(function (err, author) {
                if (err) {
                    done(err, {
                        message: err.message
                    });
                }
                else if (author) {
                    done(true, {
                        message: 'Author already exists by that name or username'
                    });
                }
                else {
                    var new_author = new Author({
                        name: name,
                        username: username,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                        location: (req.body.location) ? req.body.location : '',
                        image: (req.body.image) ? req.body.image : '',
                        packs: [],                        
                        hits: {
                            daily: 0,
                            weekly: 0,
                            monthly: 0,
                            total: 0
                        }
                    });
                    new_author.save(function (err, new_author) {
                        if (err) {
                            done(err, {
                                message: err.message
                            });
                        }
                        else {
                            done(null, {
                                message: 'Author successfully created'
                            });
                        }
                    });
                }
            };
        }
        else {
            done(null, {
                message: 'Required parameters not found'
            });
        }
    }
}, {
    path: '/author/:id',
    method: 'PUT',
    handler: function(req, done) {
	
	}
}];
