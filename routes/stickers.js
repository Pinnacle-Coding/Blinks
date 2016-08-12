module.exports = {
    '/sticker': {
        method: 'GET',
        export: function (req, res) {
            res.status(200).json({
                message: 'Connected!'
            });
        }
    }
}
