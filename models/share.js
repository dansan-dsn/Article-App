const mongoose = required('mongoose')

const ShareSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  article: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article", 
    required: true 
},

  sharedAt: {
     type: Date,
      default: Date.now 
    },
});

module.exports = mongoose.model("Share", ShareSchema);
