const mongoose = require('mongoose')

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

    category: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

}, {
    versionKey: false
})

ArticleSchema.pre('save', (next) => {
    this.updatedAt = Date.now()
    next()
})

module.exports = mongoose.model('Article', ArticleSchema)