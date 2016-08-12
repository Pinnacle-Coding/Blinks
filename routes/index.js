const router = require('express').Router();

var add = function (routes) {
    for (var path in routes) {
        if (routes.hasOwnProperty(path)) {
            var method = routes[path].method.toLowerCase();
            var called = routes[path].export;
            if (method === 'get') {
                router.get(path, called);
            }
            else if (method === 'post') {
                router.post(path, called);
            }
            else if (method === 'put') {
                router.put(path, called);
            }
            else if (method === 'delete') {
                router.delete(path, called);
            }
        }
    }
}

add(require('./stickers'));
add(require('./packs'));
add(require('./authors'));
add(require('./tags'));

module.exports = router;
