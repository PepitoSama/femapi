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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  tags: [String],
  likes: [{
    userId: mongoose.Schema.Types.ObjectId
  }],
  responses: [{
    idResponse: Number,
    userId: mongoose.Schema.Types.ObjectId,
    content: String,
    likes: [{
      userId: mongoose.Schema.Types.ObjectId
    }]
  }]
})

module.exports = mongoose.model('Remark', RemarkSchema)
