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
                        payload.state = 'error';
                        res.status(400).json(payload);
                    }
                    else {
                        payload.state = 'success';
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

add('./stickers');
add('./packs');
add('./authors');
add('./tags');

module.exports = router;
