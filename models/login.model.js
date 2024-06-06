
const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true
		},

		name: {
			type: String,
			required: true
		},

		tel: {
			type: String,
			required: true
		},

		token: {
			type: String,
			required: true
		},

		password: {
			type: String,
			required: true
		},

		createdAt: {
			type: Date,
			default: Date.now
		},

		lastLogin: {
			type: Date,
			default: Date.now
		}

	},
	{
		versionKey: false
	}
)

module.exports = new mongoose.model('users', LoginSchema)