require('dotenv').config()
const express = require('express')
const router = express.Router()
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
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
				return Math.floor(Math.random() * 10) // generates a token
			}
			
			let TOKEN = ''
			for(let i = 0; i < 5; i++) {
				TOKEN += TString()
			}
			
			// generate a token
			const jToken = jwt.sign(
				{ id: collection._id},
				process.env.JWT_SECRET,
				{
					expiresIn: '1h'
				}
			)

			const data = {
				email: req.body.email,
				username: req.body.username,
				tel: req.body.tel,
				userToken: TOKEN,
				passToken: jToken,
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
					console.log(userdata)
					// res.render('partials/login', {error: null})

					const transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: process.env.EMAIL_USER,
							pass: process.env.EMAIL_PASS
						}
					})

					const mailOption = {
						from: process.env.EMAIL_USER,
						to: process.env.EMAIL_USER,
						subject: 'User Registration',
                        html: `
                            <h1>User Verification</h1>
                            <p>Please click on the link below to verify your account</p>
                            <a href="http://localhost:8080/api/user/verify/${jToken}">http://localhost:8080/api/user/verify/${jToken}</a>`
					}
					const sendMail = async (transporter, mailOption) => {
						await transporter.sendMail(mailOption)
						console.log('Email sent')
						res.status(200).json({
							message : "Successfully registered! and email sent" // login
						})
					}
					sendMail(transporter, mailOption)
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
			check.status = 'active'
			await check.save()

			if( check.status === 'active') {
			// check for status as well if active
			if(check) {
				// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(isPasswordMatch) {
				// res.status(200).render('home')

				// generate passtoken
					check.lastLogin = Date.now()  // update on login date
				    await check.save()
					
				res.status(200).json({
					message: "successfully logged in!",
					Info: {
						userToken: check.userToken,
						username: check.username,
						email: check.email,
						tel: check.tel,
						passToken: `Valid for only 1hr "${check.passToken}"`,
						createdAt: check.createdAt,
						lastLogin: check.lastLogin,
						status: check.status
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
		}else {
			res.status(403).json({message: 'Please activate your accout!'})
		}
			
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })

	  .delete('/delete_user/:id', async (req, res) => {
		  try {
			const userId  = req.params.id
			const user = await collection.findById(userId)
			if(!user) {
				return res.status(404).json({message: "User not found"})
			}
              await collection.findByIdAndDelete(userId)
			  
			//   collection.status == 'deactive'
			//   await collection.save()
			  res.status(200).json({message: "User deleted successfully", status: "deactive"})
			
		 } catch (error) {
			res.status(500).json({message: "Internal server error"})
		 }
	  })


module.exports = router