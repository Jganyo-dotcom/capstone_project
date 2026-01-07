const streak_model = require("../../shared models/streak_model");
const Goal = require("../Goal_managent_module/goal_model");
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
    console.log("Querying streak with userId:", userId, "goalId:", goalId);
    let streak = await streak_model.findOne({ userId, goal: goalId });
    if (!streak) {
      console.log("not there one");
      return res.status(404).json({ message: "Streak not found" });
    }
    const goal = await Goal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      console.log("not there 4");
      return res.status(404).json({ message: "Goal not found" });
    }
    const step = goal.steps.find((s) => s.index === stepIndex);
    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    // Step 2: Mark step as completed
    if (!step.completed) {
      step.completed = true;
      await goal.save();
    }

    // Step 3: Frequency-aware streak logging
    let alreadyLogged = false;
    if (step.frequency === "Daily") {
      // Daily → must log exact date
      alreadyLogged = streak.completedDates?.some(
        (d) => d.getTime() === today.getTime()
      );
      if (!alreadyLogged) {
        streak.completedDates.push(today);
      }
    } else if (step.frequency === "Weekly") {
      // Weekly → log by week start date (Monday UTC)
      const weekStart = getWeekStart(today); // helper returns Date object
      alreadyLogged = streak.completedWeeks?.some(
        (d) => new Date(d).getTime() === weekStart.getTime()
      );
      if (!alreadyLogged) {
        streak.completedWeeks.push(weekStart); // store as Date
      }
    }

    function getWeekStart(date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0); // normalize to midnight UTC

      // ISO week: Monday is the first day
      const dayNum = d.getUTCDay() || 7; // Sunday=0 → 7
      d.setUTCDate(d.getUTCDate() - dayNum + 1); // shift back to Monday

      return d; // Date object for Monday of that week
    }

    // Step 4: Update streak progression
    if (!streak.lastActiveDate) {
      // First activity → initialize streak
      streak.lastActiveDate = today;
      streak.currentStreak = 1;
      streak.longestStreak = 1;
      streak.startDate = today;
      streak.endDate = null;
    } else {
      const diff = daysBetween(streak.lastActiveDate, today);

      if (diff === 0) {
        // Already logged today → no change
      } else if (diff === 1 || step.frequency === "Weekly") {
        // Daily consecutive OR weekly submission → streak continues
        streak.currentStreak += 1;
        streak.longestStreak = Math.max(
          streak.longestStreak,
          streak.currentStreak
        );
        streak.lastActiveDate = today;
        streak.endDate = null;
      } else if (diff > 1) {
        // Streak broke → reset
        streak.endDate = streak.lastActiveDate;
        streak.currentStreak = 1;
        streak.startDate = today;
        streak.lastActiveDate = today;
        streak.longestStreak = Math.max(
          streak.longestStreak,
          streak.currentStreak
        );
      }
    }

    await streak.save();

    // Step 5: Return updated info
    return res.json({
      message: "Step ticked and streak updated",
      step,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      startDate: streak.startDate,
      endDate: streak.endDate,
      completedDates: streak.completedDates,
      completedWeeks: streak.completedWeeks,
    });
  } catch (err) {
    console.error("Error updating streak:", err);
    return res.status(500).json({ message: "Server error" });
  }
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

    return res.status(200).json({
      message: "Streak fetched successfully",
      currentStreak: streak.currentStreak || 0,
      longestStreak: streak.longestStreak || 0,
      lastActiveDate: streak.lastActiveDate || null,
      startDate: streak.startDate || null,
      endDate: streak.endDate || null,
      completedDates: streak.completedDates || [], // daily streaks
      completedWeeks: streak.completedWeeks || [], // weekly streaks
    });
  } catch (error) {
    console.error("Error fetching streaks:", error);
    next(error);
  }
};

module.exports = { updateStreak, getStreaks };
