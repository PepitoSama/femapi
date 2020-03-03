// Router
const router = require('express').Router()
// Token Verification
const connected = require('./privateRouter')
// Remarks Model
const Remark = require('../models/Remark')
// Model Validation
const { remarkValidation, responseValidation, likeValidation } = require('../validation/remarkValidation')

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
    res.status(200).json(remarks)
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
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
  // Check if remark is valid
  const { error } = remarkValidation(req.body)

  // 400 Bad Request
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Get last remark id
  var idNewRemark = await Remark.find().sort({ id: -1 }).limit(1)

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
    res.status(201).json({ id: savedRemark.id })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
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
  // 400 Bad Request
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Check if user own the remark
  try {
    const remark = await Remark.findOne({
      id: req.params.id,
      userId: req.user._id
    })
    // 401 Unauthorized
    if (!remark) return res.status(401).send({ error: 'You don\'t own this ressource' })
    // 400 Bad Request
    if (remark.content === req.body.content) return res.status(400).send({ error: 'New content must be different' })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
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
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/*
|===============================================================================
| DELETE :id
| Delete an existing Remark
| Restriction : User must own the remark
|===============================================================================
*/
router.delete('/:id', connected, async (req, res) => {
  // Check if user own the remark
  try {
    const remark = await Remark.findOne({
      id: req.params.id,
      userId: req.user._id
    })
    // 401 Unauthorized
    if (!remark) return res.status(401).send({ error: 'Ressource not owned or does not exist' })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }

  // Delete the remark
  try {
    await Remark.deleteOne({ id: req.params.id })
    res.status(200).send({ message: 'Deleted !' })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/*
|===============================================================================
| POST response/:id
| Post a response on a remark
| Restriction : User must be connected
|===============================================================================
*/
router.post('/response/:id', connected, async (req, res) => {
  // Check if Response is valid
  const { error } = responseValidation(req.body)
  // 400 Bad Request
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Check if remark exists
  try {
    const remark = await Remark.findOne({
      id: req.params.id
    })
    // 401 Unauthorized
    if (!remark) return res.status(401).send({ error: 'Ressource does not exist' })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }

  // Get last remark id
  var idNewResponse = await Remark.findOne({ id: req.params.id })
  if (!idNewResponse.responses) {
    idNewResponse = 0
  } else {
    idNewResponse = idNewResponse.responses.length
  }
  // Add response to the remark
  try {
    await Remark.updateOne({
      id: req.params.id
    }, {
      $addToSet: {
        responses: {
          idResponse: idNewResponse,
          userId: req.user._id,
          content: req.body.content
        }
      }
    })
    // 201 Created
    res.status(201).send({ id: idNewResponse })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/*
|===============================================================================
| POST like/:id
| Like a remark
| Restriction : User must be connected
|===============================================================================
*/
router.post('/like/:id', connected, async (req, res) => {
  // Will be used to know if user already liked the remark
  var liked = null

  // Check if Like is valid
  const { error } = likeValidation(req.body)
  // 400 Bad Request
  if (error) return res.status(400).send({ error: error.details[0].message })

  try {
    // Check if remark exists
    const remark = await Remark.findOne({ id: req.params.id })

    // 401 Unauthorized
    if (!remark) return res.status(401).send({ error: 'Ressource does not exist' })

    // Check if user already liked the remark
    liked = await Remark.findOne({
      likes: {
        $elemMatch: {
          userId: req.user._id
        }
      }
    })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }

  // Add like to the remark
  try {
    if (liked === null && req.body.value) {
      await Remark.updateOne({
        id: req.params.id
      }, {
        $addToSet: {
          likes: {
            userId: req.user._id
          }
        }
      })
      // 201 Created
      res.status(201).send({ messsage: 'Liked', id: req.params.id })
    } else if (!liked && req.body.value) {
      await Remark.updateOne({
        id: req.params.id
      }, {
        $addToSet: {
          likes: {
            userId: req.user._id
          }
        }
      })
      // 201 Created
      res.status(201).send({ messsage: 'Liked', id: req.params.id })
    } else if (liked && !req.body.value) {
      await Remark.updateOne({
        id: req.params.id
      }, {
        $pull: {
          likes: {
            userId: req.user._id
          }
        }
      })
      // 200 OK
      res.status(200).send({ messsage: 'Unliked !', id: req.params.id })
    } else {
      // 417 Expectation Failed
      res.status(417).send({ error: 'Action already done' })
    }
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/*
|===============================================================================
| POST :idRemark/like/:idResponse
| Like a response
| Restriction : User must be connected
|===============================================================================
*/
router.post('/:idRemark/like/:idResponse', connected, async (req, res) => {
  // Will be used to know if user already liked the remark
  var liked = false

  // Check if Like is valid
  const { error } = likeValidation(req.body)
  if (error) return res.status(400).send({ error: error.details[0].message })

  // Check if remark and response exists
  try {
    const remark = await Remark.findOne({
      id: req.params.idRemark,
      responses: {
        $elemMatch: {
          idResponse: req.params.idResponse
        }
      }
    })

    if (!remark) return res.status(401).send({ error: 'Ressource does not exist' })

    remark.responses.forEach((response) => {
      response.likes.forEach((like) => {
        if (like.userId.toString() === req.user._id) liked = true
      })
    })
    // Add like to the remark
    if (!liked && req.body.value) {
      remark.responses.forEach((response) => {
        if (response.idResponse.toString() === req.params.idResponse) {
          response.likes.push({ userId: req.user._id })
        }
      })
      await remark.save()
      res.status(201).send({ messsage: 'Liked !', idRemark: req.params.idRemark, idResponse: req.params.idResponse })
    } else if (liked && !req.body.value) {
      remark.responses.forEach((response) => {
        if (response.idResponse.toString() === req.params.idResponse) {
          response.likes = response.likes.filter((like) => {
            return like.userId.toString() !== req.user._id
          })
        }
      })
      remark.save()
      // 200 OK
      res.status(200).send({ messsage: 'UnLiked !', idRemark: req.params.idRemark, idResponse: req.params.idResponse })
    } else {
      // 417 Expectation Failed
      res.status(417).send({ error: 'Action already done' })
    }
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = router
