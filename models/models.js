var mongoose = require('mongoose');

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
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
AuthorSchema.pre('save', function (next) {
    if (!this.noUpdate) {
        this.updatedAt = Date.now();
        this.updatedAtTimestamp = this.updatedAt.getTime();
    }
    else {
        this.noUpdate = false;
    }
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
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
PackSchema.pre('save', function (next) {
    if (!this.noUpdate) {
        this.updatedAt = Date.now();
        this.updatedAtTimestamp = this.updatedAt.getTime();
    }
    else {
        this.noUpdate = false;
    }
    next();
});
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
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
StickerSchema.pre('save', function (next) {
    if (!this.noUpdate) {
        this.updatedAt = Date.now();
        this.updatedAtTimestamp = this.updatedAt.getTime();
    }
    else {
        this.noUpdate = false;
    }
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
    noUpdate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    createdAtTimestamp: Number,
    updatedAtTimestamp: Number
});
TagSchema.pre('save', function (next) {
    if (!this.noUpdate) {
        this.updatedAt = Date.now();
        this.updatedAtTimestamp = this.updatedAt.getTime();
    }
    else {
        this.noUpdate = false;
    }
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
