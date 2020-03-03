const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

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

module.exports.responseValidation = responseValidation
