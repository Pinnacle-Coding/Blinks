module.exports = {
    paths: {
        '/': {
            method: 'GET',
            export: function (req, res) {
                res.status(200).json({
                    message: 'Connected!'
                });
            }
        }
    }
}
