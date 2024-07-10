const express = require("express");
const route = express.Router();
const Article = require("../models/article.model");
const User = require("../models/user.model");
const pin_model = require("../models/pin");

route.get("/_one/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pin_article = await pin_model
      .findById(id)
      .populate("user", "username");

    if (!pin_article)
      return res.status(404).json({ message: "Article not found" });

    res.status(200).json(pin_article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get("/_all", async (req, res) => {
  try {
    const pin_article = await pin_model.find({}).populate("user", "username");
    if (!pin_article)
      return res.status(404).json({ message: "Articles not found" });

    res.status(200).json(pin_article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.post("/create/:article_id/:user_id", async (req, res) => {
  try {
    const { article_id, user_id } = req.params;
    const article = await Article.findById(article_id);
    const user = await User.findById(user_id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const pinned = await pin_model.create({
      article: article,
      user: user,
    });

    res.status(200).json({ message: "Article pinned successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.delete("/undo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.status(200).json({ message: "Article unpinned successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = route;
