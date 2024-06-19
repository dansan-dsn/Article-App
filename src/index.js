require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const user_router = require('../routes/user.routes')
const article_route = require('../routes/article.route')
const comment_route = require('../routes/comment.routes')
const notification_route = require('../routes/notifications')
const like_route = require('../routes/like.route')
const PORT = process.env.PORT || 8080

const app = express()

// middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
 
// routes
app.use('/api/user', user_router)
app.use('/api/article', article_route)
app.use('/api/comment', comment_route)
app.use('/api/notification', notification_route)
app.use('/api/like', like_route)

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => {
	console.log('DB connected')

	// server config
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}...`)
	})
})
.catch(() => {
	console.log('DB disconnected')
})