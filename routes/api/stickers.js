module.exports = [
    {
        path: '/stickers',
        method: 'POST',
        handler: function (req, done) {
            done(false, {
                message: 'Connected!'
            });
        }
    }
]
