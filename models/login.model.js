
const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},

		password: {
			type: String,
			required: true
		}
	},
	{
		versionKey: false
	}
)

module.exports = new mongoose.model('users', LoginSchema)