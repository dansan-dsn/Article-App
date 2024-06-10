
const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true
		},

		username: {
			type: String,
			required: true
		},

		tel: {
			type: String,
			required: true
		},

		userToken: {
			type: String,
			required: true
		},

		passToken: {
			type: String,
            required: false,
			default: null
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
		},

		status: {
			type: String,
			default: "pending"
		}

	},
	{
		versionKey: false
	}
)

module.exports = new mongoose.model('users', LoginSchema)