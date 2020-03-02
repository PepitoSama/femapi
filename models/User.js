const mongoose = require('mongoose')

/*
|===============================================================================
| User Model
| This file contain the User Model that is used in Database
|===============================================================================
*/

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 320
  }
})

module.exports = mongoose.model('User', UserSchema)
