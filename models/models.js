var mongoose = require('mongoose');

mongoose.model('Author', new mongoose.Schema({
    name: String,
    location: String,
    image: String,
    packs: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Pack'
    }]
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
    }
}));

mongoose.model('Sticker', new mongoose.Schema({
    name: String,
    image: String,
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
    }
}));
