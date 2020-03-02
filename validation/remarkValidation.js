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

module.exports.remarkValidation = remarkValidation
