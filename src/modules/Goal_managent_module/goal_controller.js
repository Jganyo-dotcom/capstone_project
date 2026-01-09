const Joi = require("joi");
const GoalModel = require("../../shared models/goal_model.js");
const UserModel = require("../../shared models/User_model.js");
const wp = require("web-push");
const streak_model = require("../../shared models/streak_model.js");
wp.setVapidDetails(
  "mailto:elikemejay@gmail.com",
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);
const createGoal = async (req, res, next) => {
  try {
    const { title, steps, startDate, endgoal, frequency } = req.body;
    const newGoal = new GoalModel({
      user: req.user.id,
      title: title,
      startDate: startDate || new Date(),
      endDate: endgoal || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "active",
      frequency: frequency,
      inactiveUntil: req.body.inactiveUntil || null,
      steps: steps,
      lastNotifiedStep: 0,
    });

    await newGoal.save();
    const goal_streak = new streak_model({
      userId: req.user.id,
      goal: newGoal._id,
    });

    await goal_streak.save();

    return res.status(200).json({
      message: "Goal added susccessfully",
      data: newGoal,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const addStep = async (req, res, next) => {
  try {
    const goal = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.steps.push({
      index: goal.steps.length,
      content: req.body.content,
      completed: false,
    });

    await goal.save();

    return res.status(200).json({
      message: "Step added successfully",
      data: goal.steps,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateStep = async (req, res, next) => {
  try {
    const goal = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.steps[req.params.stepIndex].completed = req.body.completed;

    await goal.save();

    res.json(goal.steps[req.params.stepIndex]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateGoalDetails = async (req, res, next) => {
  try {
    const details = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!details) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    if (req.body.title !== undefined) {
      details.title = req.body.title;
    }

    if (req.body.startDate !== undefined) {
      details.startDate = req.body.startDate;
    }

    if (req.body.endDate !== undefined) {
      details.endDate = req.body.endDate;
    }

    if (details.endDate <= startDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    await goal.save();

    return res.status(200).json({
      message: "Goal details updated",
      data: details,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const toggleGoalStatus = async (req, res, next) => {
  try {
    const toggle = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!toggle) {
      return res.status(404).json({ message: "Goal not found" });
    }

    toggle.status = req.body.status;
    toggle.inactiveUntil =
      req.body.status === "inactive" ? req.body.inactiveUntil : null;

    await toggle.save();
    res.json(toggle);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getGoals = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const filter = { user: req.user.id };
    const total = await GoalModel.countDocuments(filter);
    const goals = await GoalModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return res.status(200).json({
      message: "Goals fetched successfully",
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
      goals,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    next(error);
  }
};

const getGoalById = async (req, res, next) => {
  try {
    const goal = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      message: "Goals retrieved successfully",
      data: goal,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await GoalModel.findOneAndDelete({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteStep = async (req, res, next) => {
  try {
    const goal = await GoalModel.findOne({
      _id: req.params.goalId,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found!" });
    }

    const stepIndex = Number(req.params.stepIndex);

    if (
      Number.isNaN(stepIndex) ||
      stepIndex < 0 ||
      stepIndex >= goal.steps.length
    ) {
      return res.status(400).json({
        message: "Invalid Step Index",
      });
    }

    goal.steps.splice(stepIndex, 1);

    goal.steps.forEach((step, index) => {
      step.index = index;
    });

    await goal.save();

    return res.status(200).jsonS({
      message: `Step ${stepIndex} deleted successfully`,
      data: goal.steps,
    });
  } catch (error) {
    console.error(error);
    next(NativeError);
  }
};

async function clearGoals(req, res) {
  try {
    await GoalModel.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "All goals cleared successfully" });
  } catch (err) {
    console.error("Error clearing goals:", err);
    res.status(500).json({ message: "Error clearing goals" });
  }
}

// upcoming deadlines on goals
const Upcoming_goal = async (req, res) => {
  try {
    const today = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);
    const up_goal = await GoalModel.find({
      user: req.user.id,
      endDate: { $gte: today, $lte: sevenDays },
    });
    console.log(up_goal, "empyt");
    return res.status(200).json({ message: "upcoming goal", up_goal });
  } catch (err) {
    console.error("Error clearing goals:", err);
    res.status(500).json({ message: "Error clearing goals" });
  }
};

module.exports = {
  createGoal,
  addStep,
  updateStep,
  updateGoalDetails,
  toggleGoalStatus,
  getGoals,
  getGoalById,
  deleteGoal,
  deleteStep,
  clearGoals,
  Upcoming_goal,
};
