const mongoose = require('mongoose')

/*
|===============================================================================
| Remark Model
| This file contain the Remark Model that is used in Database
|===============================================================================
*/

const RemarkSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true,
    min: 3
  },
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  tags: [String],
  likes: [{
    user: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String
    }
  }],
  responses: [{
    idResponse: Number,
    user: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String
    },
    content: String,
    likes: [{
      user: {
        userId: mongoose.Schema.Types.ObjectId,
        username: String
      }
    }]
  }]
})

module.exports = mongoose.model('Remark', RemarkSchema)
