var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var AuthorSchema = new mongoose.Schema({
    name: String,
    username: String,
    location: String,
    image: {
        type: String,
        default: '/static/img/default-author.png'
    },
    s3: String,
    packs: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Pack'
    }],
    hits: {
        total: {
            type: Number,
            default: 0
        },
        daily: {
            type: Number,
            default: 0
        },
        weekly: {
            type: Number,
            default: 0
        },
        monthly: {
            type: Number,
            default: 0
        }
    },
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
AuthorSchema.plugin(timestamps);
AuthorSchema.pre('save', function (next) {
    this.createdAtTimestamp = this.createdAt.getTime();
    this.updatedAtTimestamp = this.updatedAt.getTime();
    next();
});
mongoose.model('Author', AuthorSchema);

var PackSchema = new mongoose.Schema({
    name: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Author'
    },
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }],
    hits: {
        total: {
            type: Number,
            default: 0
        },
        daily: {
            type: Number,
            default: 0
        },
        weekly: {
            type: Number,
            default: 0
        },
        monthly: {
            type: Number,
            default: 0
        }
    },
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
PackSchema.plugin(timestamps);
PackSchema.pre('save', function (next) {
    this.createdAtTimestamp = this.createdAt.getTime();
    this.updatedAtTimestamp = this.updatedAt.getTime();
    next();
});
mongoose.model('Pack', PackSchema);

var StickerSchema = new mongoose.Schema({
    image: String,
    s3: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Author'
    },
    tags: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag'
    }],
    pack: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pack'
    },
    hits: {
        total: {
            type: Number,
            default: 0
        },
        daily: {
            type: Number,
            default: 0
        },
        weekly: {
            type: Number,
            default: 0
        },
        monthly: {
            type: Number,
            default: 0
        }
    },
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
StickerSchema.plugin(timestamps);
StickerSchema.pre('save', function (next) {
    this.createdAtTimestamp = this.createdAt.getTime();
    this.updatedAtTimestamp = this.updatedAt.getTime();
    next();
});
mongoose.model('Sticker', StickerSchema);

var TagSchema = new mongoose.Schema({
    name: String,
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }],
    hits: {
        total: {
            type: Number,
            default: 0
        },
        daily: {
            type: Number,
            default: 0
        },
        weekly: {
            type: Number,
            default: 0
        },
        monthly: {
            type: Number,
            default: 0
        }
    },
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
TagSchema.plugin(timestamps);
TagSchema.pre('save', function (next) {
    this.createdAtTimestamp = this.createdAt.getTime();
    this.updatedAtTimestamp = this.updatedAt.getTime();
    next();
});
mongoose.model('Tag', TagSchema);

mongoose.model('Metrics', new mongoose.Schema({
    version: String,
    hits: {
        daily: {
            type: Date,
            default: Date.now
        },
        weekly: {
            type: Date,
            default: Date.now
        },
        monthly: {
            type: Date,
            default: Date.now
        }
    }
}));
