const mongoose = require('mongoose')
const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Articles'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = new mongoose.model('likes', LikeSchema)