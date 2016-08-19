/**

BLINKS.IO API ROUTES
====================
Base URL: http://blinks-app.herokuapp.com

1. Trending Stickers = /api/stickers?type=trending [DONE]
2. Trending Searches = /api/tags?type=trending [DONE]
3. Suggested Searches = /api/tags?contains={{string}} [DONE]
4. Sticker Search = /api/stickers?tag={{string}}&page={{integer}}&count={{integer}} [DONE]
   - 'count' is the number of items per page
5. All Packs = /api/packs?page={{integer}}&count={{integer}} [DONE]
6. Trending Packs = /api/packs?type=trending&page={{integer}}&count={{integer}} [DONE]
7. Pack Detail Info = /api/pack/:id [DONE]
   - 'id' can be the name of a pack as well
8. Artist Detail Info = /api/author/:id [DONE]
   - 'id' can be the name of an author as well

*/

/**

HOW THIS API WORKS
==================

1. Create a file. The different files are purely for organization.
2. In the file, write:

module.exports = [

]

3. To add a route (i.e 'GET /api/stickers'), add it to exports. For example:

module.exports = [
    {
        path: '/stickers' // Note: no need to add /api/, this is already done via middleware
        method: 'GET'
        handler: function (req, done) {
            done(false, {
                message: 'Done.'
            });
        }
    }
]

4. In the handler function, you will notice that two parameters are passed in. The first is the HTTP request
itself (params, body, etc.). The second is the callback function. It signals the conclusion of the handler. No code
goes after it.

Done receives two parameters. The first is a boolean signaling whether an error has occurred or not. The second is a JSON
payload to be sent back to the user.

5. You're done! This API will automatically load the file and setup the routes for you. You can also add as many files as
you want to.

*/

const router = require('express').Router();

var add = function (filename) {
    require(filename).forEach(function(route) {
        var path = route.path;
        var method = route.method.toLowerCase();
        var callback = function (req, res) {
            route.handler(req, function (err, payload) {
                if (err) {
                    res.status(400).json(payload);
                } else {
                    res.status(200).json(payload);
                }
            });
        };
        if (method === 'get') {
            router.get(path, callback);
        } else if (method === 'post') {
            router.post(path, callback);
        } else if (method === 'put') {
            router.put(path, callback);
        } else if (method === 'delete') {
            router.delete(path, callback);
        }
    });
}

require('fs').readdirSync(require('path').join(__dirname, 'api')).forEach(function (file) {
    add('./api/' + file);
});

module.exports = router;
