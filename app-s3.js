var s3 = require('s3');
var client = s3.createClient({
    s3Options: {
        accessKeyId: "AKIAIOJZPC34FBRZCTGQ",
        secretAccessKey: "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"
    }
});

module.exports = client;
