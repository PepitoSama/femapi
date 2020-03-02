// Router
const router = require('express').Router()
// Token Verification
const connected = require('./privateRouter')
// Remarks Model
const Remark = require('../models/Remark')
// Remark Model Validation
const { remarkValidation } = require('../validation/remarkValidation')

/*
|===============================================================================
| Remark routes
| This file contain all route to handle /remark request
|===============================================================================
*/

/*
|===============================================================================
| GET
| Get all remarks
| Restriction : No
|===============================================================================
*/
router.get('/', async (req, res) => {
  try {
    const remarks = await Remark.find()
    res.json(remarks)
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

/*
|===============================================================================
| GET :id
| Get on remark from it id
| Restriction : No
|===============================================================================
*/
router.get('/:id', async (req, res) => {
  const remark = await Remark.findOne({ id: req.params.id })
  if (!remark) return res.status(404).json({ error: 'No remark found with id ' + req.params.id })
  res.status(200).json(remark)
})

/*
|===============================================================================
| POST
| Create a new Remark
| Restriction : User must be connected
|===============================================================================
*/
router.post('/', connected, async (req, res) => {
  // Get last remark id
  var idNewRemark = await Remark.find().sort({ id: -1 }).limit(1)

  // Check if remark is valid
  const { error } = remarkValidation(req.body)
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Create Remark Model
  const remark = new Remark({
    content: req.body.content,
    userId: req.user
  })

  if (req.body.tags) remark.tags = req.body.tags

  if (idNewRemark.length === 0) {
    remark.id = 0
  } else {
    remark.id = idNewRemark[0].id + 1
  }

  // Post the remark in db
  try {
    const savedRemark = await remark.save()
    res.json({
      id: savedRemark.id
    })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

/*
|===============================================================================
| PATCH :id
| Modify an existing Remark
| Restriction : User must own the remark
|===============================================================================
*/
router.patch('/:id', connected, async (req, res) => {
  // Check if Remark is valid
  const { error } = remarkValidation(req.body)
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Check if user own the remark
  try {
    const remark = await Remark.findOne({
      id: req.params.id,
      userId: req.user._id
    })
    if (!remark) return res.status(401).send({ error: 'You don\'t own this ressource' })
    if (remark.content === req.body.content) return res.status(400).send({ error: 'New content must be different' })
  } catch (err) {
    res.status(500).json({ message: err })
  }

  // Patch the remark
  try {
    await Remark.updateOne({
      id: req.params.id
    }, {
      $set: {
        content: req.body.content
      }
    })
    res.status(200).json({
      id: req.params.id,
      content: req.body.content
    })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

/*
|===============================================================================
| DELETE :id
| Delete an existing Remark
| Restriction : User must own the remark
| /!\ TODO
|===============================================================================
*/
router.delete('/:id', connected, async (req, res) => {
  // Check if user own the remark
  try {
    const remark = await Remark.findOne({
      id: req.params.id,
      userId: req.user._id
    })
    if (!remark) return res.status(401).send({ error: 'Ressource not owned or existing' })
  } catch (err) {
    res.status(500).json({ message: err })
  }

  // Delete the remark
  try {
    const deletedPost = await Remark.deleteOne({ id: req.params.id })
    res.send(deletedPost)
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

module.exports = router
