const Joi = require("joi");

const validationForRegisterSchema = Joi.object({
  name: Joi.string().min(5).required(),
  username: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  confirm_password: Joi.string().min(6).required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(6).default("N/A"),
});

const validationForLogin = Joi.object({
  main: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { validationForRegisterSchema, validationForLogin };
