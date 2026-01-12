const reward_model = require("../../shared models/reward_model");
const streak_model = require("../../shared models/streak_model");
const Goal = require("../../shared models/goal_model");
const mongoose = require("mongoose");

// Helper: difference in whole days between two dates
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Normalize both to midnight UTC so time-of-day doesn’t affect result
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);

  const diffMs = d2 - d1; // milliseconds difference
  return Math.floor(diffMs / 86400000); // convert to days
}

// Update streak when a specific step is completed, respecting Daily or Weekly frequency
async function updateStreak(req, res) {
  try {
    const goalId = new mongoose.Types.ObjectId(req.params.goalId);
    const stepIndex = Number(req.params.stepIndex);
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date();
    console.log(today);
    today.setUTCHours(0, 0, 0, 0); // normalize to midnight UTC

    console.log("Querying streak with userId:", userId, "goalId:", goalId);

    let streak = await streak_model.findOne({ userId, goal: goalId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }

    const goal = await Goal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const step = goal.steps.find((s) => s.index === stepIndex);
    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    // Step 2: Mark step as completed
    if (!step.completed) {
      step.completed = true;
    }

    // Step 3: Frequency-aware streak logging
    if (step.frequency === "Daily") {
      const alreadyLogged = streak.completedDates?.some(
        (d) => new Date(d).getTime() === today.getTime()
      );
      if (!alreadyLogged) {
        streak.completedDates.push(today);
        goal.completedSteps.push(today);

        goal.array.push(step.name);
        if (goal.array.length === step.index + 1) {
          goal.nature = "Done";
        }
        streak.currentStreak += 1;
      }
      //  Always increment streak for each step
    } else if (step.frequency === "Weekly") {
      const weekStart = getWeekStart(today);
      const alreadyLogged = streak.completedWeeks?.some(
        (d) => new Date(d).getTime() === weekStart.getTime()
      );
      if (!alreadyLogged) {
        streak.completedWeeks.push(weekStart);
        goal.completedWeeks.push(weekStart);
        if (goal.array.length === step.index + 1) {
          goal.nature = "Done";
        }
        streak.currentStreak += 1;
      }
      // Always increment streak for each step
    }

    // Step 4: Update streak progression metadata
    if (!streak.lastActiveDate) {
      streak.lastActiveDate = today;
      streak.longestStreak = streak.currentStreak;
      streak.startDate = today;
      streak.endDate = null;
    } else {
      const diff = daysBetween(streak.lastActiveDate, today);

      if (diff === 0) {
        // Same day → streak continues, already incremented above
        streak.lastActiveDate = today;
      } else if (diff === 1 || step.frequency === "Weekly") {
        // Next day or weekly → streak continues
        streak.lastActiveDate = today;
        streak.endDate = null;
      } else if (diff > 1) {
        // Streak broke → reset start
        streak.endDate = streak.lastActiveDate;
        streak.startDate = today;
        streak.lastActiveDate = today;
      }
    }

    // Update longest streak
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await goal.save({ session });
      await streak.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }


    return res.json({
      message: "Step ticked and streak updated",
      step,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      startDate: streak.startDate,
      endDate: streak.endDate,
      completedDates: streak.completedDates || [],
      completedWeeks: streak.completedWeeks || [],
      goalCompletedSteps: goal.completedSteps || [],

    });
  } catch (err) {
    console.error("Error updating streak:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Helper
function getWeekStart(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 1);
  return d;
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / 86400000);
}

// GET /student/streaks/:goalId
const getStreaks = async (req, res, next) => {
  try {
    console.log(
      "Fetching streak for user:",
      req.user.id,
      "goal:",
      req.params.goalId
    );
    const goalId = req.params.goalId;

    // Find streak record for this user + goal
    const streak = await streak_model
      .findOne({
        userId: req.user.id, // user resolved from auth middleware
        goal: goalId,
      })
      .lean();

    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }
    const goal = await Goal.findOne({
      user: req.user.id, // user resolved from auth middleware
      _id: goalId,
    });
    if (!goal) {
      return res.status(404).json({ message: "Streak not found" });
    }

    return res.status(200).json({
      message: "Streak fetched successfully",
      currentStreak: streak.currentStreak || 0,
      longestStreak: streak.longestStreak || 0,
      lastActiveDate: streak.lastActiveDate || null,
      startDate: streak.startDate || null,
      endDate: streak.endDate || null,
      completedDates: goal.completedSteps || [],
      completedWeeks: goal.completedWeeks || [],
      goalCompletedSteps: goal.completedSteps || [],
    });
  } catch (error) {
    console.error("Error fetching streaks:", error);
    next(error);
  }
};

async function checkRewards(req ,res,userId) {

  const streaks = await streak_model.find({ userId, longestStreak: 30 });
  if (streaks.length > 0) {
    res
      .status(200)
      .json({ message: "you have unlocked our biggest", reward: "unlock" });
  } else {
    res.status(404).json({ message: "keep moving" });
  }
  const goal = await Goal.find({ userId: userId, nature: "Done" });
  if (goal.length > 0) {
    res.status(200).json({ message: "you have a reward from us", goal });
  } else {
    res.status(404).json({ message: "keep moving" });
  }
  const goalsCompleted = await Goal.countDocuments({
    userId,
    nature: "Done",
  });
  if (goalsCompleted.length > 6) {
    res
      .status(200)
      .json({ message: "you have a reward from us", reward: "unlock" });
  } else {
    return res.status(404).json({ message: "continue completing goals" });
  }

  //   const longest = Math.max(...streaks.map((s) => s.longestStreak), 0);

  //   for (let reward of rewards) {
  //     if (!reward.unlocked) {
  //       let unlock = false;

  //       // Continuous streak badge (basic streak length)
  //       if (
  //         reward.criteria.streakLength &&
  //         longest >= reward.criteria.streakLength
  //       ) {
  //         unlock = true;
  //       }

  //       //  No breaks badge (continuous streak without endDate)
  //       if (reward.criteria.noBreaks) {
  //         const continuous = streaks.some(
  //           (s) => !s.endDate && s.currentStreak >= reward.criteria.streakLength
  //         );
  //         if (continuous) unlock = true;
  //       }

  //       // Multiple goals medal
  //       if (
  //         reward.criteria.goalsCompleted &&
  //         goalsCompleted >= reward.criteria.goalsCompleted
  //       ) {
  //         unlock = true;
  //       }

  //       if (unlock) {
  //         reward.unlocked = true;
  //         reward.unlockedAt = new Date();
  //         await reward.save();
  //       }
  //     }
  //   }

  //   return rewards.filter((r) => r.unlocked);
}

// async function changeToDone() {}

module.exports = { updateStreak, getStreaks };
