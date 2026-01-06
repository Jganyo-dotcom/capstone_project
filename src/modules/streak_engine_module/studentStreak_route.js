const express = require('express');
const router = express.Router();

const {
  getStudentStreak,
  updateStreak
} = require('./streak_controller');

const {
  updateStreakValidation,
  getStreakValidation
} = require('./streak_validation');

// GET student streak
router.get(
  '/streak/:id',
  getStreakValidation,
  getStudentStreak
);

// UPDATE streak
router.post(
  '/update/:id',
  updateStreakValidation,
  updateStreak
);

module.exports = router;