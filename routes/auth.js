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

  // Check if user already exist
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send({ error: 'Email Already exist !' })
  const usernameExist = await User.findOne({ username: req.body.username })
  if (usernameExist) return res.status(400).send({ error: 'Username Already taken !' })

  // Hash the password
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(req.body.password, salt)

  // Create and save the new user
  const user = new User({
    username: req.body.username,
    password: hashPassword,
    email: req.body.email
  })

  try {
    const savedUser = await user.save()
    res.json({
      id: savedUser._id,
      username: savedUser.username
    })
  } catch (err) {
    res.json({ message: err })
  }
})

router.post('/login', async (req, res) => {
  // Validation
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // Check if user already exist
  const user = await User.findOne({
    username: req.body.username
  })
  if (!user) return res.status(400).send({ error: 'Authentification failed' })

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send({ error: 'Authentification failed' })

  // Create a token for user
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
  res.header('auth-token', token).send(token)
})
module.exports = router
