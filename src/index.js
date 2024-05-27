const express = require('express')
const mongoose = require('mongoose')
const router = require('../routes/login.route')
const PORT = process.env.PORT || 8080

const app = express()

// middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
 
// routes
app.use('/api/user', router)

// connect to the database
mongoose.connect('mongodb+srv://ddryn970:login@login.1qsof7j.mongodb.net/?retryWrites=true&w=majority&appName=login', {
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
