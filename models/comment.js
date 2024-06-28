const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },

  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Articles",
    required: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },

  created_at: {
    type: Date,
    default: Date.now(),
  },

  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = new mongoose.model("comments", commentSchema);
