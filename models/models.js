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
    }]
}));

mongoose.model('Sticker', new mongoose.Schema({
    name: String,
    image: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Author'
    },
    pack: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pack'
    },
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }]
}));

mongoose.model('Tag', new mongoose.Schema({
    name: String,
    stickers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Sticker'
    }]
}));
