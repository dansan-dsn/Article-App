const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const collection = require("../models/article.model");

router
  .post("/create-article", async (req, res) => {
    try {
      const { title, content, imageUrl, author, category } = req.body;

      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({ message: "Invalid author ID" });
      }

      const newArticle = new collection({
        title,
        content,
        imageUrl,
        category,
        author
      });

      const new_article = await newArticle.save();
      res.status(200).json(new_article);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .put("/update-article", async (req, res) => {
    try {
      const { title, content, imageUrl, author, category } = req.body;

      const updatedArticle = await collection.findOneAndUpdate({
        title,
        content,
        imageUrl,
        category,
        author,
      });

      if (!updatedArticle)
        return res.status(404).json({ message: "Article cannot be found for update" });

      res.status(200).json({ message: "Article successfully updated", updatedArticle });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

    router.get("/get-articles", async (req, res) => {
    try {
        const articles = await collection.find({}, '-_id')

        if(!articles) return res.status(404).json({message: 'Articles not found'})
        
        res.status(200).json({message: articles})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
  })

  .get("/get_an_article/:id", async (req, res) => {
    try {
        const {id} = req.params
        const article = await collection.findById(id, '-_id')

        if(!article) return res.status(404).json({message: 'article cannot be found'})
        
        res.status(200).json({message: article})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
  })

  .delete('/delete_article/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedArticle = await collection.findByIdAndDelete(id)
        if(!deletedArticle) return res.status(404).json({message: 'NO article to delete'})

        res.status(200).json({message: 'Article deleted successfully'})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
  })

module.exports = router;
