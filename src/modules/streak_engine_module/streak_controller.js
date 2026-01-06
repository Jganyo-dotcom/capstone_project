const Streak = require('../../shared models/streak_model');
const Users = require('../../shared models/User_model');

/**
 * Get a student's streak
 */
exports.getStudentStreak = async (req, res) => {
  try {
    const { userId } = req.params;

    const streak = await Streak.findOne({ userId: userId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    res.status(200).json({
      success: true,
      data: streak
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update streak when student completes an activity
 */
exports.updateStreak = async (req, res) => {
  try {
    const { userId } = req.body;

    let streak = await Streak.findOne({ userId: userId });

    if (!streak) {
      streak = await Streak.create({
        userId: userId,
        count: 1,
        lastActiveDate: new Date()
      });
    } else {
      streak.count += 1;
      streak.lastActiveDate = new Date();
      await streak.save();
    }

    res.status(200).json({
      success: true,
      message: 'Streak updated successfully',
      data: streak
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Admin: reset a student's streak
 */
exports.resetStreak = async (req, res) => {
  try {
    const { id } = req.params;

    const streak = await Streak.findOneAndUpdate(
      { student: id },
      { count: 0 },
      { new: true }
    );

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Streak reset successfully',
      data: streak
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};