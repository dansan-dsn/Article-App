const express = require('express')
const router = express.Router()
const path = require('path')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const collection = require('../models/login.model')

router.get('/login', (req, res) => {
	res.render('partials/login', {error: null})
})
      .get('/signup', (req, res) => {
		res.render('partials/signup')
	})

	  .post('/signup', async (req, res) => {
		try {
			
			const data = {
				email: req.body.email,
				password: req.body.password
			}

			const c_password = req.body.comfirm_password

            // const emailVerificationCode = generateRandomCode();

			// const transporter = nodemailer.createTransport({
			// 	service: 'gmail',
			// 	auth: {
			// 		user: data.email,
			// 		pass: data.password
			// 	}
			// })

			// const mailOptions = {
			// 	from: 'Article',
			// 	to: data.email,
			// 	subject: 'Email verification code',
			// 	text: `Your email verification code is: ${emailVerificationCode}`
			// }

			// transporter.sendMail(mailOptions, (error, info) => {
			// 	if(error) {
			// 		return res.status(500).send({message: 'error sending message'})
			// 	}
			// })


			// check if user already exits in the database
			const existingUser = await collection.findOne({email: data.email})
			if(existingUser) {
				res.render('partials/signup', {msg: 'Email has an account already.'})
			} else {

				if(data.password != c_password) {
					return res.status(400).render('partials/signup', {msg1: 'Password do not match'});
				} else {
                   // hash the password using bcrypt
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(data.password, saltRounds)

				data.password = hashedPassword // Replace the hash password with the original password

				const userdata = await collection.insertMany(data)
				console.log(userdata)
				res.render('partials/login')
				}
				 
			}
	
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	})

	  .post('/login', async (req, res) => {
		try {
			const check = await collection.findOne({email: req.body.email})
			if(!check) {
				res.redirect('/api/user/login',{err: 'User name cannot be found'})
			}

			// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(isPasswordMatch) {
				res.status(200).render('home')
			} else {
				res.render('partials/login', { error: 'Wrong password. Please try again.'})
			}
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })

module.exports = router