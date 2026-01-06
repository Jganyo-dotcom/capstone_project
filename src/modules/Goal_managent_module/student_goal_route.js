
const express = require ('express');

const {
    createGoal,
    addStep,
    updateStep,
    updateGoalDetails,
    toggleGoalStatus,
    getGoals,
    getGoalById,
    deleteGoal,
    deleteStep,
    clearGoals
} = require ('../Goal_managent_module/goal_controller.js');

const {
    validateCreateGoal,
    validateUpdateGoalDetails,
    validateStep,
    validateUpdateGoalStatus,
    validateUpdateStep
} = require ('../Goal_managent_module/goal_validation.js');

const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { CheckroleonAll } = require("../../middlewares/role.js");


router.delete("/goals", auth, CheckroleonAll, clearGoals);
router.post('/goals', validateCreateGoal, auth, createGoal);
router.post('/goals/:goalId/steps', validateStep, auth, addStep);
router.get('/goals', auth, getGoals);
router.get('/goals/goalId', auth, getGoalById);
router.patch('/goals/:goalId/status', validateUpdateGoalStatus, auth, toggleGoalStatus);
router.patch('/goals/:goalId', validateUpdateGoalDetails, auth, updateGoalDetails);
router.patch('/goals/:goalId/stepIndex', validateUpdateStep, auth, updateStep);
router.delete('/goals/:goalId', auth, deleteGoal);
router.delete('/goals/:goalId/stepIndex', auth, deleteStep);

module.exports = router;
