const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

/*
|===============================================================================
| Remark Model Verification
| This file contain the Remark Model Verification functions that are used to
| check if data are well typed
|===============================================================================
*/

// Register Valisation
const remarkValidation = (data) => {
  const remark = Joi.object({
    id: Joi
      .number(),
    content: Joi
      .string()
      .min(3)
      .required(),
    userId: Joi
      .objectId(),
    tags: Joi
      .array()
  })
  return remark.validate(data)
}

/*
|===============================================================================
| Response Model Verification
| This file contain the Response Model Verification functions that are used to
| check if data are well typed
|===============================================================================
*/

// Register Valisation
const responseValidation = (data) => {
  const response = Joi.object({
    content: Joi
      .string()
      .min(3)
      .required(),
    userId: Joi
      .objectId()
  })
  return response.validate(data)
}

/*
|===============================================================================
| Like Model Verification
| This file contain the Like Model Verification functions that are used to
| check if data are well typed
|===============================================================================
*/

// Register Valisation
const likeValidation = (data) => {
  const like = Joi.object({
    value: Joi
      .boolean()
  })
  return like.validate(data)
}

module.exports.remarkValidation = remarkValidation
module.exports.responseValidation = responseValidation
module.exports.likeValidation = likeValidation
