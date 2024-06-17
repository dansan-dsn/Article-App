const mongoose = require('mongoose')

const ReactionSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },

    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = new mongoose.model('reactions', ReactionSchema)