const jwt = require('jsonwebtoken')
const code = ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJpYXQiOjE3MTgyMDMxNzl9.NhmYhNz3rSPvp2RcrqtkSPNGL5KOcDWhwQIycTJjVXc'

const token = jwt.sign(
    {
        id: 123
    },
    code
)

console.log('Generated Token:', token)