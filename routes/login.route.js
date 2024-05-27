const express = require('express')
const router = express.Router()
const path = require('path')
const bcrypt = require('bcrypt')
const collection = require('../models/login.model')

router.get('/login', (req, res) => {
	res.render('partials/login')
})
      .get('/signup', (req, res) => {
		res.render('partials/signup')
	})

	  .post('/signup', async (req, res) => {
		try {
			
			const data = {
				name: req.body.username,
				password: req.body.password,
				comfirm_password: req.body.comfirm_password
			}

			// check if user already exits in the database
			const existingUser = await collection.findOne({name: data.name})
			if(existingUser) {
				res.send('User already exits. Please choose a different username.')
			} else {

				if(data.password != data.comfirm_password) {
					return res.status(400).send({message: 'Password do not match'});
				} else {
                   // hash the password using bcrypt
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(data.password, saltRounds)

				data.password = hashedPassword // Replace the hash password with the original password

				const userdata = await collection.insertMany(data)
				console.log(userdata)
				}
				 
			}
	
	
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	})

	  .post('/login', async (req, res) => {
		try {
			const check = await collection.findOne({name: req.body.username})
			if(!check) {
				res.send('User name cannot be found')
			}

			// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(isPasswordMatch) {
				res.status(200).render('home')
			} else {
				res.send('wrong password')
			}
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })

module.exports = router