var mongoose = require('mongoose');

var timestamps = function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
        this.createdAtTimestamp = this.createdAt.getTime();
    }
    if (!this.noUpdate) {
        this.updatedAt = Date.now();
        this.updatedAtTimestamp = this.updatedAt.getTime();
    }
    else {
        this.noUpdate = false;
    }
    next();
};

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
        counts: {
            type: [Number],
            default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        score: {
            type: Number,
            default: 0
        },
    },
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
AuthorSchema.pre('save', timestamps);
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
        counts: {
            type: [Number],
            default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        score: {
            type: Number,
            default: 0
        },
    },
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
PackSchema.pre('save', timestamps);
mongoose.model('Pack', PackSchema);

var StickerSchema = new mongoose.Schema({
    image: String,
    s3: String,
    animated: {
        type: Boolean,
        default: false
    },
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
        counts: {
            type: [Number],
            default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        score: {
            type: Number,
            default: 0
        },
    },
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
StickerSchema.pre('save', timestamps);
mongoose.model('Sticker', StickerSchema);

var TagSchema = new mongoose.Schema({
    name: String,
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }],
    hits: {
        counts: {
            type: [Number],
            default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        score: {
            type: Number,
            default: 0
        },
    },
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
TagSchema.pre('save', timestamps);
mongoose.model('Tag', TagSchema);

mongoose.model('Metrics', new mongoose.Schema({
    version: String,
    hits: {
        daily: {
            type: Date,
            default: Date.now
        }
    }
}));
