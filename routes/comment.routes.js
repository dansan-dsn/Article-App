const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Comment = require('../models/comment')

router.get('/get_comments', async(req, res) => {
    try {
        const Comments = await Comment.find({}, '-_id')
        if(!Comments) return res.status(404).json({message: 'Comment cannot be found'})

        res.status(200).json(Comments)

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

     .get('/get_comment/:id', async (req, res) => {
         const { id } = req.params
        try {
            const comment = await Comment.findById(id, '-_id, -__v')
            if(!Comment) return res.status(404).json({message: 'Comment not found'})

            res.status(200).json(comment)

        } catch (error) {
            res.status(500).json({error: error.message})
        }
     })

     .post('/create_comment', async (req, res) => {
        try {
            const { content, author, article } = req.body

            if (!mongoose.Types.ObjectId.isValid(author)) return res.status(400).json({ message: "Invalid author ID" });
            
            if(!mongoose.Types.ObjectId.isValid(article)) return res.status(400).json({message: 'Invalid article ID'})

            const createComment = new Comment({
                content,
                author,
                article
            })

            await createComment.save()
            res.status(200).json({message: 'Comment successfully created', createComment})


        } catch (error) {
            res.status(500).json({error: error.message})
        }
     })
     
     .put('/update_comment/:id', async (req, res) => {
        try {
            const { id } = req.params
            
            const comment = await Comment.findByIdAndUpdate(id, req.body)

            if(!comment) return res.status(404).json({message: 'Comment to update not found'})

            const updateComment = await Comment.findById(id)
           
            res.status(200).json({message: 'comment updated successfully', updateComment})

        } catch (error) {
            res.status(500).json({error: error.message})
        }
     })

     .delete('/delete_comment/:id', async(req, res) => {
        try {
            const { id } = req.params

            const deleteComment = await Comment.findByIdAndDelete(id)
            if(!deleteComment) return res.status(404).json({message: 'Comment for delete cannot be found'})

            res.json({message: 'Comment successfully deleted'}).status(200)

        } catch (error) {
            res.status(500).json({error: error.message})
        }
     })
     module.exports = router