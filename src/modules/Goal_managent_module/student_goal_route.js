const express = require("express");
const router = express.Router();

const {
  createGoal,
  addStep,
  updateStep,
  updateGoalDetails,
  toggleGoalStatus,
  getGoals,
  deleteGoal,
  deleteStep,
  clearGoals,
} = require("../Goal_managent_module/goal_controller.js");

const {
  validateGoal,
  validateStep,
  validateUpdateGoal,
  validateUpdateStep,
} = require("../Goal_managent_module/goal_validation.js");

const auth = require("../../middlewares/auth.js");
const { CheckroleonAll } = require("../../middlewares/role.js");

router.post("/goals", auth, createGoal);
router.delete("/goals", auth, CheckroleonAll, clearGoals);

module.exports = router;
