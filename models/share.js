const mongoose = require("mongoose");

const ShareSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },

  sharedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Share", ShareSchema);
