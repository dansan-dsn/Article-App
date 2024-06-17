const mongoose = required('mongoose')

const PinSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    article: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    } ,

    pinArticle: {
        type: Date,
        default: Date.now
    }
})

module.exports = new mongoose.model('pinArticle', PinSchema)