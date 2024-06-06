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
			
			const data = {
				email: req.body.email,
				password: req.body.password
			}

			const c_password = req.body.comfirm_password

			// check if user already exits in the database
			const existingUser = await collection.findOne({email: data.email})
			if(existingUser) {
				res.render('partials/signup', {err: 'User already exits. Please choose a different email.'})
			} else {

				if(data.password != c_password) {
					return res.status(400).render('partials/signup' ,{err: 'Password do not match'});
				} else {
                   // hash the password using bcrypt
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(data.password, saltRounds)

				data.password = hashedPassword // Replace the hash password with the original password

				const userdata = await collection.insertMany(data)
				console.log(userdata)
				res.render('partials/login', {error: null})
				}
				 
			}
	
	
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	})

	  .post('/login', async (req, res) => {
		try {
			const check = await collection.findOne({email: req.body.email})
			if(check) {
				// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(isPasswordMatch) {
				res.status(200).render('home')
			} else {
				res.render('partials/login', { error: 'Wrong password. Please try again'})
			}
			}else {
				res.render('partials/login' ,{ error: 'User name cannot be found'})
			}
			
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })

module.exports = router