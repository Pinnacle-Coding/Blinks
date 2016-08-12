module.exports = {
    '/': {
        method: 'GET',
        export: function (req, done) {
            done(false, {
                message: 'Connected!'
            });
        }
    }
}
