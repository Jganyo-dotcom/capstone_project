const Joi = require("joi");
const GoalModel = require("../Goal_managent_module/goal_model.js");
const UserModel = require("../../shared models/User_model.js");
const wp = require("web-push");
wp.setVapidDetails(
  "mailto:elikemejay@gmail.com",
  process.env.publicKey,
  process.env.privatekey
);
const createGoal = async (req, res, next) => {
  try {
    const { title, steps } = req.body;
    const newGoal = new GoalModel({
      user: req.user.id,
      title: title,
      startDate: req.body.startDate || new Date(),
      endDate:
        req.body.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: req.body.status || "active",
      inactiveUntil: req.body.inactiveUntil || null,
      steps: steps,
      lastNotifiedStep: 0,
    });

    await newGoal.save();

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
    const goals = await GoalModel.find({ user: req.user });
    res.json(goals);
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
    await GoalModel.deleteMany({});
    await UserModel.deleteMany({});
    res.status(200).json({ message: "All goals cleared successfully" });
  } catch (err) {
    console.error("Error clearing goals:", err);
    res.status(500).json({ message: "Error clearing goals" });
  }
}

module.exports = {
  createGoal,
  addStep,
  updateStep,
  updateGoalDetails,
  toggleGoalStatus,
  getGoals,
  deleteGoal,
  deleteStep,
  clearGoals,
};
