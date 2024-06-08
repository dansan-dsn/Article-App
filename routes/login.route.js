const express = require('express')
const router = express.Router()
const path = require('path')
const bcrypt = require('bcrypt')
const collection = require('../models/login.model')

router.get('/login', (req, res) => {
	res.render('partials/login', {error: null})
})
      .get('/signup', (req, res) => {
		res.render('partials/signup', {err: null})
	})

	  .post('/signup', async (req, res) => {
		try {

			const TString = () => {
				return Math.floor(Math.random() * 10)
			}
			
			let TOKEN = ''
			for(let i = 0; i < 5; i++) {
				TOKEN += TString()
			}
			
			const data = {
				email: req.body.email,
				name: req.body.name,
				tel: req.body.tel,
				token: TOKEN,
				password: req.body.password
			}

			const c_password = req.body.comfirm_password

			// check if user already exits in the database
				const existingUser = await collection.findOne({email: data.email})
				if(existingUser) {
					// res.render('partials/signup', {err: 'User already exits. Please choose a different email.'})
					res.status(500).json({message: 'Email, already in use'})
				} else {

					if(data.password != c_password) {
						// return res.status(400).render('partials/signup' ,{err: 'Password do not match'});
						res.status(400).json({error: 'Password do not match'})
					} else {
					// hash the password using bcrypt
					const saltRounds = 10;
					const hashedPassword = await bcrypt.hash(data.password, saltRounds)

					data.password = hashedPassword // Replace the hash password with the original password

					const userdata = await collection.insertMany(data)
					console.log("userdata", userdata)
					// res.render('partials/login', {error: null})
					res.status(200).json({
						message : "Successfully registered!" // login
					})
					}
					
				}

		} catch (error) {
			res.status(500).json({message: error.message})
		}
	})

	  .post('/login', async (req, res) => {
		try {
			const emailCheck = await collection.findOne({email: req.body.email})
			const phoneCheck = await collection.findOne({tel: req.body.tel})

			const check = emailCheck || phoneCheck
			if(check) {
				// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(isPasswordMatch) {
				// res.status(200).render('home')

				check.lastLogin = Date.now()  // update on login date
				await check.save()

				res.status(200).json({
					message: "successfully logged in!",
					Info: {
						token: check.token,
						name: check.name,
						email: check.email,
						tel: check.tel,
						createdAt: check.createdAt,
						lastLogin: check.lastLogin
						}
				})
			} else {
				// res.render('partials/login', { error: 'Wrong password. Please try again'})
				res.json({status: "422", error: "wrong password"}).status(422)
			}
			}else {
				// res.render('partials/login' ,{ error: 'User name cannot be found'})
				res.status(404).json({status: "404" ,error: "User not found"})
			}
			
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })

	  .delete('/delete_user', async (req, res) => {
		 const { user } = req.body
	     try {
			const userId = await collection.findById(user)
		 } catch (error) {
			res.status(500).json({message: message.error})
		 }
	  })


module.exports = router