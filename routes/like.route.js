const express = require('express')
const route = express.Router()
const Notification = require('../models/notification')
const Article = require('../models/article.model')
const Like = require('../models/like')

route.post('/create_likes', async (req, res) => {
    try {
        const { userId, articleId } = req.body
        // const like = await Like.create({
        //     article: articleId,
        //     author: userId
        // })

        const article = await Article.findById(articleId).populate('author')  // we are filling the author with id from the user model

       const notification = await Notification.create({
            type: "like",
            articleOwner: article.author._id,
            message:`Your article was liked by ${userId}`
        })
        res.status(201).json(notification)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = route

// we user - article - like, comment (notify)