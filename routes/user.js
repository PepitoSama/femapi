const express = require('express')
const router = express.Router()

// User Model
const User = require('../models/User')

// Token Verification
const connected = require('./privateRouter')
/*
|===============================================================================
| User routes
| This file contain all route to handle /user request
|===============================================================================
*/
router.get('/', async (req, res) => {
  try {
    User.find().then((users) => {
      res.json(users)
    })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get('/:username', async (req, res) => {
  try {
    User.find({ username: req.params.username }).then((users) => {
      res.json(users)
    })
  } catch (err) {
    res.json({ message: err })
  }
})

router.patch('/', connected, async (req, res) => {
  try {
    User.updateOne({
      username: req.body.username
    }, {
      $set: {
        username: req.body.newUsername
      }
    }).then((users) => {
      res.json(users)
    })
  } catch (err) {
    res.json({ message: err })
  }
})

router.delete('/', connected, async (req, res) => {
  try {
    User.deleteOne({ username: req.body.username }).then((deletedUser) => {
      res.json(deletedUser)
    })
  } catch (err) {
    res.json({ message: err })
  }
})

// Export
module.exports = router
