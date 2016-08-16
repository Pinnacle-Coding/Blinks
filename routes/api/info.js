module.exports = [
    {
        path: '/last-updates',
        method: 'GET',
        handler: function (req, done) {
            var UPDATE_HITS_FILE = './update-hits.json';
            var dates = JSON.parse(fs.readFileSync(UPDATE_HITS_FILE, 'utf8'));
            done(false, dates);
        }
    }
];
