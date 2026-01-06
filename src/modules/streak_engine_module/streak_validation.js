const { body, param } = require('express-validator');

exports.updateStreakValidation = [
  body('userId')
    .notEmpty()
    .withMessage('Student ID is required')
];

exports.getStreakValidation = [
  param('userId')
    .notEmpty()
    .withMessage('Student ID is required')
];