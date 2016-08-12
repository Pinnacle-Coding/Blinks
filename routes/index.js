const routes = require('express').Router();

var add = function (routes) {
    for (var path in routes.paths) {
        if (routes.hasOwnProperty(path)) {
            var method = routes[path].method.toLowerCase();
            var called = routes[path].export;
            if (method === 'get') {
                routes.get(path, called);
            }
            else if (method === 'post') {
                routes.post(path, called);
            }
            else if (method === 'put') {
                routes.put(path, called);
            }
            else if (method === 'delete') {
                routes.delete(path, called);
            }
        }
    }
}

add(require('./stickers'));
add(require('./packs'));
add(require('./authors'));
add(require('./tags'));

module.exports = routes;
