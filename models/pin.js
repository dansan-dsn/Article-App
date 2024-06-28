const mongoose = require("mongoose");
const PinSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Articles",
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = new mongoose.model("pinned", PinSchema);
