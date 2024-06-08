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
				userToken: TOKEN,
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

					// // create webtoken and send to the user
					// const token = jwt.sign({
                    //     email: data.email,
                    //     tel: data.tel
                    // }, process.env.JWT_SECRET, {expiresIn: '1h'})

					// // create a transport
					// const transporter = nodemailer.createTransport({
                    //     service: 'gmail',
                    //     auth: {
                    //         user: process.env.EMAIL,
                    //         pass:  process.env.PASSWORD
                    //     }
                    // })

					// // email option
					// let mainOptions = {
					// 	from: process.env.EMAIL,
                    //     to: data.email,
                    //     subject: 'Account Verification',
                    //     html: `
                    //         <h1>Please verify your account</h1>
					// 		<p>Your verification token is ${token}</p>
                            
                    //     `
					// } 

					// // send mail
					// transporter.sendMail(mainOptions, (err, info) => {
                    //     if(err) {
                    //         console.log(err)
                    //         res.status(500).json({message: err.message})
                    //     } else {
                    //         console.log(info)
                    //         res.status(200).json({message: 'Email sent'})
                    //     }
                    // })

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
			check.status = 'active'
			await check.save()

			if( check.status === 'active') {
			// check for status as well if active
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
						userToken: check.userToken,
						name: check.name,
						email: check.email,
						tel: check.tel,
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

	  .delete('/delete_user', async (req, res) => {
		 const { userId } = req.params.id
	     try {
			const user = await collection.findById(user)
			if(user) {
				await collection.deleteOne({_id: userId})
                res.status(200).json({message: "User deleted"})
				user.status == 'deactive'
				await user.save()
			}
		 } catch (error) {
			res.status(500).json({message: message.error})
		 }
	  })


module.exports = router