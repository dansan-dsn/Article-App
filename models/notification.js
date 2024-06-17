const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    user: {
         type: Schema.Types.ObjectsId,
         ref: 'users',
         required: true
    },

    message: {
        type: String,
        required: true
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