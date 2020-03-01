const Joi = require('@hapi/joi')

// Register Valisation
const registerValidation = (data) => {
  const user = Joi.object({
    username: Joi
      .string()
      .min(6)
      .max(255)
      .required(),
    password: Joi
      .string()
      .min(8)
      .required(),
    email: Joi
      .string()
      .min(6)
      .max(255)
      .required()
      .email()
  })
  return user.validate(data)
}

// Register Valisation
const loginValidation = (data) => {
  const user = Joi.object({
    username: Joi
      .string()
      .min(6)
      .max(255)
      .required(),
    password: Joi
      .string()
      .min(8)
      .required()
  })
  return user.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
