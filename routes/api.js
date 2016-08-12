/**

HOW THIS API WORKS
==================
by David Hacker

1. Create a file. The different files are purely for organization.
2. In the file, write:

module.exports = {

}

3. To add a route (i.e 'GET /api/stickers'), add it to exports. For example:

module.exports = {
    '/stickers': { // Note: no need to add /api/, this is already done via middleware
        method: 'GET'
        export: function (req, done) {
            done(false, {
                message: 'Done.'
            });
        }
    }
}

4. In the exported function, you will notice that two parameters are passed in. The first is the HTTP request
itself (params, body, etc.). The second is the done function. 'done' signals the conclusion of the function. No code
goes after it.

Done receives two parameters. The first is a boolean signaling whether an error has occurred or not. The second is a JSON
payload to be sent back to the user.

5. You're done! This API will automatically load the file and setup the routes for you. You can also add as many files as
you want to.

*/

const router = require('express').Router();

var add = function (filename) {
    var routes = require(filename);
    for (var path in routes) {
        if (routes.hasOwnProperty(path)) {
            var method = routes[path].method.toLowerCase();
            var called = routes[path].export;
            var route = function(req, res) {
                called(req, function (err, payload) {
                    if (err) {
                        res.status(400).json(payload);
                    }
                    else {
                        res.status(200).json(payload);
                    }
                });
            };
            if (method === 'get') {
                router.get(path, route);
            }
            else if (method === 'post') {
                router.post(path, route);
            }
            else if (method === 'put') {
                router.put(path, route);
            }
            else if (method === 'delete') {
                router.delete(path, route);
            }
        }
    }
}

require('fs').readdirSync(require('path').join(__dirname, 'api')).forEach(function (file) {
    add('./api/'+file);
});

module.exports = router;
