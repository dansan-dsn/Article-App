const express = require('express')
const route = express.Router()
const Notification = require('../models/notification')
const Article = require('../models/article.model')
const Like = require('../models/like')

route.post('/create_likes/:userId/:articleId', async (req, res) => {
    try {
        const { userId, articleId } = req.params
        const like = await Like.create({
            user: userId,
            article: articleId
        })

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

    .get('/content-likes', async (req, res) => {
        try {
            const likes = await Like.findOne({})
            res.status(200).json(likes)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    })

    .delete('/unlike/:id', async (req, res) => {
        try {
            const { id } = req.params
            const unlike = await Like.findByIdAndDelete(id)
            if(!unlike) return res.status(404).json({message: 'unliked article not found'})
            res.status(200).json({message: 'article unliked'})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    })

module.exports = route

// we user - article - like, comment (notify)