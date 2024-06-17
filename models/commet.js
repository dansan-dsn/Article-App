const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Articles',
        required: true
    },

    created_at: {
        type: Date,
        default: Date.now()
    },

    updated_at: {
        type: Date,
        default: Date.now()
    },

    deleted_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = new mongoose.model('comments', commentSchema)