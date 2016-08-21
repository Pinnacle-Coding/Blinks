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

    }
}, {
    path: '/authors',
    method: 'POST',
    handler: function(req, done) {
		
    }
}, {
    path: '/author/:id',
    method: 'PUT',
    handler: function(req, done) {
	
	}
}];
