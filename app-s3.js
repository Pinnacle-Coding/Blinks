var s3 = require('s3');
var client = s3.createClient({
    s3Options: {
        accessKeyId: "ID",
        secretAccessKey: "KEY"
    }
});

module.exports = client;
