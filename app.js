require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes/user.route')
// const bcrypt = require('bcrypt')
const PORT = process.env.PORT || 3002

const app = express()

// middleware
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs')

// routes
app.use('/', router)

// database and server config
// mongoose.connect(process.env.MONGODB_URI)
// .then(() => {
//     console.log('database connected!!!');
//     app.listen(PORT, () =>{
//         console.log(`Server listening on port ${PORT}`);
//     })
// })
// .catch(() => {
//     console.log('database disconnected.')
// })

app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`);
})