const express = require("express");
const route = express.Router();
const Share = require("../models/share");

route.post("/:article_id", async (req, res) => {
  try {
    const { article_id } = req.params;
    // const article = await Article.findById(articleId).populate("author");

    await Share.create({
      article: article_id,
    });
    res.status(200).json({ message: "successfully shared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route
  .get("/", async (req, res) => {
    try {
      const sharedArticles = await Share.find({});
      if (!sharedArticles)
        return res.status(404).json({ message: "Cannot find shared article" });

      res.status(200).json({ message: sharedArticles });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  .get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedArticle = await Share.findById(id);
      res.status(200).json({ message: sharedArticle });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = route;
