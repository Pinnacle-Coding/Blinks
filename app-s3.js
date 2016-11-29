var s3 = require('s3');
var client = s3.createClient({
    s3Options: {
        accessKeyId: process.env.BLINKS_ACCESS_KEY,
        secretAccessKey: process.env.BLINKS_SECRET_ACCESS_KEY
    }
});

module.exports = client;
