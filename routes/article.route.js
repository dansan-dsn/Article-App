const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const collection = require('../models/article.management')

router.post('/create-article', async (req, res) => {
    try {
        const { title, content, imageUrl, author } = req.body

        if (!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: 'Invalid author ID' });
          }

        const newArticle = new collection({
            title,
            content,
            imageUrl,
            author,
            comment: [],
            reactions: [],
            pinned: [],
            shareBy: []
        })

        const new_article = await newArticle.save()
        res.status(200).json(new_article)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = router