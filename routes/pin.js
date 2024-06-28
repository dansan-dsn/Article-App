const express = require("express");
const route = express.Router();
const Article = require("../models/article.model");
const pinArticle = require("../models/pin");

route.get("/_one/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pinned = await pinArticle.findById(id);
    if (!pinned) return res.status(404).json({ message: "Article not found" });

    res.status(200).json(pinned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get("/_all", async (req, res) => {
  try {
    const pinned = await pinArticle.find({});
    if (!pinned) return res.status(404).json({ message: "Articles not found" });

    res.status(200).json(pinned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.post("/create/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const pinned = await pinArticle.create({
      article: article,
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
