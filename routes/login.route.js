const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const collection = require('../models/login.model')

	  router.post('/signup', async (req, res) => {
		try {

			// generate a token
			const token = jwt.sign(
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
				passToken: token,
				password: req.body.password,
				status: 'deactive'
			}

			const comfirmPassword = req.body.comfirmPassword

			// check if user already exits in the database
				const existingUser = await collection.findOne({email: data.email})
				if(existingUser) return res.status(500).json({message: 'Email, already in use'})

					if(data.password != comfirmPassword) return res.status(400).json({error: 'Password do not match'})
					
					// hash the password using bcrypt
					const saltRounds = 10;
					const hashedPassword = await bcrypt.hash(data.password, saltRounds)

					data.password = hashedPassword // Replace the hash password with the original password

					const userdata = await collection.insertMany(data)
					console.log(userdata)

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
                            <a href="http://localhost/confirm-password/${token}">Click For Authenticaton"</a>`
					}

					const sendMail = async (transporter, mailOption) => {
						await transporter.sendMail(mailOption)
						console.log('authorization email sent')
						res.status(200).json({
							message : "Successfully registered! and authorization email sent" // login
						})
					}
					sendMail(transporter, mailOption)
					
					// update the status
					const updateStatus = await collection.findOneAndUpdate(
                        {email: data.email},
                        {status: 'pending'}
                    )
                    console.log(updateStatus)

		} catch (error) {
			res.status(500).json({message: error.message})
		}
	})


	.post('/verify', async (req, res) => {
		try {
			const { passToken } = req.body

			if(!passToken) return res.status(404).json({error: 'Token is required'})
		
				// verify the token
			const decoded = jwt.verify(passToken, process.env.JWT_SECRET)
			if(!decoded) return res.json({error: 'Invalid Token'})

			// verify user using the token
			const user = await collection.findOne({passToken})
			if(!user) return res.status(404).json({error: 'User not found'})

			// update the status to active
			await collection.findOneAndUpdate({email: req.body.email}, {status: 'active'})

			res.status(200).json({message: 'Authentication complete.'})
			

		} catch (error) {
			res.status(500).json({error: error.message})
		}
	})

	  .post('/login', async (req, res) => {
		try {
			const emailCheck = await collection.findOne({email: req.body.email})
			const phoneCheck = await collection.findOne({tel: req.body.tel})

			const check = emailCheck || phoneCheck

			// check for status as well if active
			if(check.status != 'active') return res.status(403).json({message: 'Please activate your account!'})

			if(!check) return res.status(404).json({status: "404" ,error: "User not found"})

				// compare hashed password from the database with plain text
			const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
			if(!isPasswordMatch) return res.json({status: "422", error: "wrong password"}).status(422)

					check.lastLogin = Date.now()  // update on login date
				    await check.save()
					
		
				res.status(200).json({
					message: "successfully logged in!",
					Info: {
						username: check.username,
						email: check.email,
						tel: check.tel,
						passToken: `Valid for only 1hr "${emailCheck.passToken}}"`,
						createdAt: check.createdAt,
						lastLogin: check.lastLogin,
						status: check.status
						}
				})
  
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	  })


	  .put('/deactivate_account', async (req, res) => {
			try {
				
				const email = req.body.email

				const existingUser = await collection.findOne({email: email})
				if(!existingUser) return res.status(404).json({message: "User can't be found"})

				await collection.updateOne({email: req.body.email}, {status: 'deactive'})
				res.status(200).json({message: `Account ${email} has been deactivated`})
				
			} catch (error) {
				res.json({error: error.message})
			}
	  })

	  .put('/activate_account', async (req, res) => {
		  try {
			const email = req.body.email
			const updateAccount = await collection.findOne({email: email})
			if(!updateAccount) return res.status(404).json({message: 'Account can not be found'})
			
			await collection.updateOne({email: email}, {status: 'active'})
			res.status(200).json({message: `Account ${email} has been updated`})

		  } catch (error) {
			 res.status(500).json({error: error.message})
		  }
	  })

	  .post('/forgot_password', async (req, res) => {
		try {
			const email = req.body.email
			const existingUser = await collection.findOne({email: email})
			if(!existingUser) return res.status(404).json({message: "User can't be found"})
				const token = jwt.sign(
                    { id: existingUser._id},
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h'
                    }
                )

				const transporter = nodemailer.createTransport({
					service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass:  process.env.EMAIL_PASS
                    }
				})
				const mailOption = {
					from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER,
                    subject: 'Password Reset',
                    html: `
                        <h1>Password Reset</h1>
                        <p>Please click on the link below to reset your password</p>
                        <a href="http://localhost/reset-password/${token}">Reset Password"</a>`
				}

				const sendMail = async (transporter, mailOption) => {
                    await transporter.sendMail(mailOption)
                    console.log('password reset email sent')
                    res.status(200).json({
                        message : "password reset email sent", // Reseting password
						token: `${token}`
                    })
                }
                sendMail(transporter, mailOption)
				await collection.findOneAndUpdate( {passToken: token} )

		} catch (error) {
			res.status(505).json({error: error.message})
		}
	  })

	   .post('/reset_forgotten_password', async (req, res) => {
		try {
			const { passToken, password, comfirmPassword } = req.body
			if(!passToken) return res.status(404).json({error: 'Token is required'})

			const decoded = jwt.verify(passToken, process.env.JWT_SECRET)
			if(!decoded) return res.status(404).json({error: 'Invalid Token'})

			const user = await collection.findOne({passToken})
			if(!user) return res.status(404).json({error: 'User cannot be found'})

			if(password != comfirmPassword) return res.status(400).json({error: 'Password do not match'})
			
			const hashedPassword = await bcrypt.hash(password, 10)
			user.password =  hashedPassword   // update password using the user

			await user.save()
			await collection.findOneAndUpdate({passToken: null})
            res.status(200).json({message: 'Password updated successfully'})
	
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	});


	    router.post('/new_token', async (req, res) => {
			try {
				const { email } = req.body
				const user = await collection.findOne({email: email})
				if(!user) return res.status(404).json({error: 'User not found'})
				
				const token = jwt.sign(
                    { id: user._id},
                    process.env.JWT_SECRET,
                    {
					    expiresIn: '1h'
                    }
                )

				const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass:  process.env.EMAIL_PASS
                    }
                })
                const mailOption = {
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER,
                    subject: 'Reset Authentication',
                    html: `
                        <h1>Password Reset</h1>
                        <p>Please click on the link below to update your authorization</p>
                        <a href="http://localhost/reset-password/${token}">Reset Authorization"</a>`
                }

				const sendMail = (transporter, mailOption) => {
					transporter.sendMail(mailOption)
                    console.log('Authorization reset email sent')
                    res.status(200).json({
                        message : "Authorization reset email sent", // Reseting password
                        token: `${token}`
                    })
				}
				sendMail(transporter, mailOption)
				await collection.findOneAndUpdate( {passToken: token} )

			} catch (error) {
				res.status(500).json({error: error.message})
			}
		})

module.exports = router

// regenerate token - token expired