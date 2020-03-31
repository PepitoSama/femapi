// Router
const router = require('express').Router()
// Encryption
const bcrypt = require('bcryptjs')
// User Model
const User = require('../models/User')
// User Model Validation
const { registerValidation, loginValidation } = require('../validation/userValidation')
// Token
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
  // Validation
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Check if email already exist
  User.findOne({ email: req.body.email }).then((emailExist) => {
    if (emailExist) return res.status(400).send({ error: 'Email Already exist !' })
    // Check if username already exist
    User.findOne({ username: req.body.username }).then((usernameExist) => {
      if (usernameExist) return res.status(400).send({ error: 'Username Already taken !' })
    })

    // Hash the password
    bcrypt.genSalt(10).then((salt) => {
      bcrypt.hash(req.body.password, salt).then((hashPassword) => {
        // Create and save the new user
        const user = new User({
          username: req.body.username,
          password: hashPassword,
          email: req.body.email
        })

        try {
          user.save().then((savedUser) => {
            res.status(201).json({
              id: savedUser._id,
              username: savedUser.username
            })
          })
        } catch (err) {
          res.status(500).json({ error: 'Internal Server Error' })
        }
      })
    })
  })
})

router.post('/login', async (req, res) => {
  // Validation
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  try {
    // Check if user already exist
    User.findOne({
      username: req.body.username
    }).then((user) => {
      if (!user) return res.status(400).send({ error: 'Authentification failed' })
      // Check if password is correct
      bcrypt.compare(req.body.password, user.password).then((validPass) => {
        if (!validPass) return res.status(400).send({ error: 'Authentification failed' })
        // Create a token for user
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_SECRET)
        res.header('auth-token', token).json({
          'auth-token': token
        })
      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
module.exports = router
