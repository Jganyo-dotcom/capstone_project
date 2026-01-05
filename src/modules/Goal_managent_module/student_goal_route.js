const express = require ('express');

const {
    createGoal,
    addStep,
    updateStep,
    updateGoalDetails,
    toggleGoalStatus,
    getGoals,
    deleteGoal,
    deleteStep
} = require ('../Goal_managent_module/goal_controller.js');

const {
       validateGoal,
    validateStep,
    validateUpdateGoal,
    validateUpdateStep
} = require ('../Goal_managent_module/goal_validation.js');

const auth = require ('../middlewares/auth.js');

const router = express.Router();

router.post('/goals/:goalId/step');
router.get('/goals');
router.post('/goals/:goalId/steps');
router.patch('/goals/:goalId/status');
router.patch('/goals/:goalId/stepIndex')
