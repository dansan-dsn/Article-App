const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    articleOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        // required: true
    },

    read: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = new mongoose.model('notification', NotificationSchema)