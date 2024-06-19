const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const Comment = require("../models/comment");
const user = require('../models/user.model')
const Notification = require("../models/notification");
const Article = require("../models/article.model");

router
  .get("/get_comments", async (req, res) => {
    try {
      const Comments = await Comment.find({}, "-_id");
      if (!Comments)
        return res.status(404).json({ message: "Comment cannot be found" });

      res.status(200).json(Comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .get("/get_comment/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const comment = await Comment.findById(id, "-_id, -__v");
      if (!Comment)
        return res.status(404).json({ message: "Comment not found" });

      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .post("/article", async (req, res) => {
   
    try {
      
      const { content, authorId, articleId } = req.body
      const comment = await Comment.create({  // create a comment... 
        content,
        author: authorId,
        article: articleId
      })
     
      // Notify the article owner
      const article = await Article.findById(articleId).populate('author')  // we are filling the author with id from the user model
      const notification = await Notification.create({  // create a notification
        type: 'comment',
        articleOwner: article.author._id,
        message: `New comment on your article by ${authorId}`
      })

      res.status(201).json({message: comment, notification})

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .put("/update_comment/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const comment = await Comment.findByIdAndUpdate(id, req.body);

      if (!comment)
        return res.status(404).json({ message: "Comment to update not found" });

      const updateComment = await Comment.findById(id);

      res
        .status(200)
        .json({ message: "comment updated successfully", updateComment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .delete("/delete_comment/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const deleteComment = await Comment.findByIdAndDelete(id);
      if (!deleteComment)
        return res
          .status(404)
          .json({ message: "Comment for delete cannot be found" });

      res.json({ message: "Comment successfully deleted" }).status(200);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
module.exports = router;
