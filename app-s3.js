var s3 = require('s3');
var client = s3.createClient({
    s3Options: {
        accessKeyId: "AKIAJLKAYQQZTOXMCC4A",
        secretAccessKey: "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"
    }
});

module.exports = client;
