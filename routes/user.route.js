const express = require('express')
const router = express.Router()

router.get('/login', (req, res) => {
        res.render('partials/login')
      })

      .get('/signup', (req, res) => {
        res.render('partials/signup')
      })


module.exports = router