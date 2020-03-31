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
    const number = req.query.number === '0'
      ? 0
      : parseInt(req.query.number) || 1
    const start = parseInt(req.query.start) || 0
    var findConfig = {}
    if (req.query.search) {
      findConfig = { tags: { $all: req.query.search.split(' ') } }
    }

    Remark.find(findConfig).skip(start).limit(number).then((result) => {
      res.status(200).json(result)
    })
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
  Remark.findOne({ id: req.params.id }).then((remark) => {
    if (!remark) return res.status(404).json({ error: 'No remark found with id ' + req.params.id })
    res.status(200).json(remark)
  })
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
  Remark.find().sort({ id: -1 }).limit(1).then((idNewRemark) => {
    // Create Remark Model
    const remark = new Remark({
      content: req.body.content,
      user: {
        userId: req.user._id,
        username: req.user.username
      }
    })

    if (req.body.tags) remark.tags = req.body.tags

    if (idNewRemark.length === 0) {
      remark.id = 0
    } else {
      remark.id = idNewRemark[0].id + 1
    }

    // Post the remark in db
    try {
      remark.save().then((savedRemark) => {
        res.status(201).json(savedRemark)
      })
    } catch (err) {
      // 500 Internal Server Error
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })
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
    Remark.findOne({
      id: req.params.id
    }).then((remark) => {
      // 401 Unauthorized
      if (!remark) return res.status(401).send({ error: 'This ressource doesn\'t exist' })
      if (remark.user.userId.toString() !== req.user._id) return res.status(401).send({ error: 'You don\'t own this ressource' })
      // 400 Bad Request
      if (remark.content === req.body.content) return res.status(400).send({ error: 'New content must be different' })

      // Patch the remark
      try {
        Remark.updateOne({
          id: req.params.id
        }, {
          $set: {
            content: req.body.content
          }
        }).then((remark) => {
          res.status(200).json({
            id: req.params.id,
            content: req.body.content
          })
        })
      } catch (err) {
        // 500 Internal Server Error
        res.status(500).json({ error: 'Internal Server Error' })
      }
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
    Remark.findOne({ id: req.params.id }).then((remark) => {
      // 401 Unauthorized
      if (!remark) return res.status(401).send({ error: 'This ressource doesn\'t exist' })
      if (remark.user.userId.toString() !== req.user._id) return res.status(401).send({ error: 'You don\'t own this ressource' })
      // Delete the remark
      try {
        Remark.deleteOne({ id: req.params.id }).then(() => {
          res.status(200).send({ message: 'Deleted !' })
        })
      } catch (err) {
        // 500 Internal Server Error
        res.status(500).json({ error: 'Internal Server Error' })
      }
    })
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
router.post('/:id', connected, async (req, res) => {
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

    // Get last remark id
    var idNewResponse = await Remark.findOne({ id: req.params.id })
    if (idNewResponse.responses.length === 0) {
      idNewResponse = 0
    } else {
      idNewResponse = idNewResponse.responses[idNewResponse.responses.length - 1].idResponse + 1
    }

    // Add response to the remark
    try {
      Remark.findOneAndUpdate({
        id: req.params.id
      }, {
        $addToSet: {
          responses: {
            idResponse: idNewResponse,
            user: {
              userId: req.user._id,
              username: req.user.username
            },
            content: req.body.content
          }
        }
      }, {
        new: true,
        useFindAndModify: false
      }).then((result) => {
        // 201 Created
        res.status(201).send(result)
      })
    } catch (err) {
      // 500 Internal Server Error
      res.status(500).json({ error: 'Internal Server Error 1' })
    }
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error 2' })
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
  // var liked = null
  // Check if Like is valid
  const { error } = likeValidation(req.body)
  // 400 Bad Request
  if (error) return res.status(400).send({ error: error.details[0].message })

  try {
    // Check if remark exists
    Remark.findOne({ id: req.params.id }).then((remark) => {
      // 401 Unauthorized
      if (!remark) return res.status(401).send({ error: 'Ressource does not exist' })

      // Check if user already liked the remark
      Remark.findOne({
        id: req.params.id,
        'likes.user.userId': req.user._id
      }).then((liked) => {
        // Add like to the remark
        try {
          if (liked === null && req.body.value) {
            Remark.updateOne({
              id: req.params.id
            }, {
              $addToSet: {
                likes: {
                  user: {
                    userId: req.user._id,
                    username: req.user.username
                  }
                }
              }
            }).then(() => {
              // 201 Created
              res.status(201).send({ messsage: 'Liked', id: req.params.id })
            })
          } else if (!liked && req.body.value) {
            Remark.updateOne({
              id: req.params.id
            }, {
              $addToSet: {
                likes: {
                  user: {
                    userId: req.user._id,
                    username: req.user.username
                  }
                }
              }
            }).then(() => {
              // 201 Created
              res.status(201).send({ messsage: 'Liked', id: req.params.id })
            })
          } else if (liked && !req.body.value) {
            Remark.updateOne({
              id: req.params.id
            }, {
              $pull: {
                likes: {
                  'user.userId': req.user._id
                }
              }
            }).then(() => {
              // 200 OK
              res.status(200).send({ messsage: 'Unliked !', id: req.params.id })
            })
          } else {
            // 417 Expectation Failed
            res.status(417).send({ error: 'Action already done' })
          }
        } catch (err) {
          // 500 Internal Server Error
          res.status(500).json({ error: 'Internal Server Error' })
        }
      })
    })
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
    Remark.findOne({
      id: req.params.idRemark,
      responses: {
        $elemMatch: {
          idResponse: req.params.idResponse
        }
      }
    }).then((remark) => {
      if (!remark) return res.status(401).send({ error: 'Ressource does not exist' })
      // Check if response already liked
      remark.responses.forEach((response) => {
        response.likes.forEach((like) => {
          if (like.user.userId.toString() === req.user._id) liked = true
        })
      })

      // Add like to the remark
      if (!liked && req.body.value) {
        remark.responses.forEach((response) => {
          if (response.idResponse.toString() === req.params.idResponse) {
            response.likes.push({
              user: {
                userId: req.user._id,
                username: req.user.username
              }
            })
          }
        })
        remark.save().then(() => {
          res.status(201).send({ messsage: 'Liked !', idRemark: req.params.idRemark, idResponse: req.params.idResponse })
        })
      } else if (liked && !req.body.value) {
        remark.responses.forEach((response) => {
          if (response.idResponse.toString() === req.params.idResponse) {
            response.likes = response.likes.filter((like) => {
              return like.user.userId.toString() !== req.user._id
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
    })
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = router
