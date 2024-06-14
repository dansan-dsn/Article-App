
const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true
		},

		username: {
			type: String,
			unique: true,
			required: true
		},

		tel: {
			type: String,
			required: true
		},

		passToken: {
			type: String,
            required: true,
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
			required: true
		},

		// role: {
		// 	type: String,
		// 	required: true
		// }

	},
	{
		versionKey: false
	}
)

module.exports = new mongoose.model('users', LoginSchema)