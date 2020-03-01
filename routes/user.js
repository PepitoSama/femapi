const express = require('express')
const router = express.Router()

// Model
const User = require('../models/User')

// Routes
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err })
  }
})

router.get('/:username', async (req, res) => {
  try {
    const users = await User.find({ username: req.params.username })
    res.json(users)
  } catch (err) {
    res.json({ message: err })
  }
})

router.patch('/', async (req, res) => {
  try {
    const users = await User.updateOne({
      username: req.body.username
    }, {
      $set: {
        username: req.body.newUsername
      }
    })
    res.json(users)
  } catch (err) {
    res.json({ message: err })
  }
})

router.delete('/', async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ username: req.body.username })
    res.json(deletedUser)
  } catch (err) {
    res.json({ message: err })
  }
})

// Export
module.exports = router
