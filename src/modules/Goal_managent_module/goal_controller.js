const Joi = require ('joi');
const GoalModel = require('../Goal_managent_module/goal_model.js');

const createGoal = async (req, res, next) => {
    try {
        const newGoal = new GoalModel({
            user: req.user.id,
            title: req.body.title,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            status: req.body.status || 'active',
            inactiveUnitl: req.body.inactiveUnitl || null,
            steps: req.body.steps || []
        });

        await newGoal.save();

        return res.status(200).json({
            message: 'Goal added susccessfully',
            data: newGoal
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

const addStep = async (req, res, next) =>{
    try {
            const goal = await GoalModel.findOne({
        _id: req.params.goalId,
        user: req.user
    });

    if(!goal)
        return res.status(404).json({message: 'Goal not found'});

    goal.steps.push({
        index: goal.steps.length,
        content: req.body.content,
        completed: false
    });

    await goal.save();
    
    return res.status(200).json({
        message: 'Step added successfully',
        data: addedStep.steps
    });

    } catch (error) {
       console.error(error);
        next(error); 
    }

};

const updateStep = async (req, res, next) =>{
    try {
            const goal = await GoalModel.findOne({
        _id: req.params.goalId,
        user: req.user
    });

    if(!updatedStep)
        return res.status(404).json({message: 'Goal not found'});

    goal.steps[req.params.stepIndex].completed = req.body.completed;

    await goal.save()

    res.json(goal.steps[req.params.stepIndex]);
    } catch (error) {
        console.error(error);
        next(error); 
    }

};

const toggleGoalStatus = async (req, res, next) => {
    try {
        const goal = await GoalModel.findOne({
        id: req.params.goalId,
        user: req.user
    });

    if (!goal)
        return res.status(404).json({message: 'Goal not found'});

    goal.status = req.body.status
    goal.inactiveUntil = req.body.status === 'inactive'
        ? req.body.inactiveUntil
        : null;

    await goal.save();
    res.json(goal);
    } catch (error) {
        console.error(error);
        next(error); 
    }
  
};

const getGoals = async (req, res, next) =>{
    try {
        const goals = await GoalModel.find({user: req.user});
        res.json(goals);
    } catch (error) {
        console.error(error);
        next(error); 
    }

};