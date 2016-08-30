var s3 = require('s3');
var client = s3.createClient({
    s3Options: {
        accessKeyId: "KEY",
        secretAccessKey: "SECRET"
    }
});

module.exports = client;
