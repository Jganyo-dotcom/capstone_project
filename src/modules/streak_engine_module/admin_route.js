const express = require('express');
const router = express.Router();

const { resetStreak } = require('./streak_controller');
const { getStreakValidation } = require('./streak_validation');

// Reset a student's streak
router.patch(
  '/reset/:studentId',
  getStreakValidation,
  resetStreak
);

module.exports = router;