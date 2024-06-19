const express = require('express')
const route = express.Router()
const Notification = require('../models/notification') 

route.post('/create', async (req, res) => {
     try {
       const notifications = new Notification(req.body)
       await notifications.save()

     } catch (error) {
        res.status(500).json({error: error.message})
     }
})

      .get('/notification/:userId', async (req, res) => {
         try {
            const notifications = await Notification.find({
               user: req.params.userId
            })
            res.status(200).json(notifications)
         } catch (error) {
            res.status(500).json({error: error.message})
         }
      })

module.exports = route