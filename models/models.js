var mongoose = require('mongoose');

mongoose.model('Author', new mongoose.Schema({
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
        all: Number,
        daily: Number,
        weekly: Number,
        monthly: Number
    },
    created: {
        type: Number,
        default: Date.now().getTime()
    },
    updated: {
        type: Number,
        default: Date.now().getTime()
    }
}));

mongoose.model('Pack', new mongoose.Schema({
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
        all: Number,
        daily: Number,
        weekly: Number,
        monthly: Number
    },
    created: {
        type: Number,
        default: Date.now().getTime()
    },
    updated: {
        type: Number,
        default: Date.now().getTime()
    }
}));

mongoose.model('Sticker', new mongoose.Schema({
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
        all: Number,
        daily: Number,
        weekly: Number,
        monthly: Number
    },
    created: {
        type: Number,
        default: Date.now().getTime()
    },
    updated: {
        type: Number,
        default: Date.now().getTime()
    }
}));

mongoose.model('Tag', new mongoose.Schema({
    name: String,
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }],
    hits: {
        total: Number,
        daily: Number,
        weekly: Number,
        monthly: Number
    },
    created: {
        type: Number,
        default: Date.now().getTime()
    },
    updated: {
        type: Number,
        default: Date.now().getTime()
    }
}));

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
