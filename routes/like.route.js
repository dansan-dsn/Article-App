const express = require('express')
const route = express.Router()
const Notification = require('../models/notification')
const Article = require('../models/article.model')
const Like = require('../models/like')

route.post('/article/:id/likes', async (req, res) => {
    try {
        const { userId, articleId } = req.body
        const like = await Article.findById(articleId).populate('author')
        await Notification.create({
            user: Article.author._id,
            message:`Your article was liked by ${userId}`
        })
        res.status(201).json(like)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = route

// we user - article - like, comment (notify)