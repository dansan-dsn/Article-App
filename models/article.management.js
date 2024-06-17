const mongoose = require('mongoose')
const collection = require('../models/user.model')

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }],

    reactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'reactions'
    }],

    pinned: [{
       type: Boolean,
       default: false
    }],

    shareBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

})

ArticleSchema.pre('save', (next) => {
    this.updatedAt = Date.now()
    next()
})

module.exports = mongoose.model('Article', ArticleSchema)