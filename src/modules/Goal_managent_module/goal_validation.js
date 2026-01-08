const Joi = require("joi");

const createGoalSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().trim(),
  steps: Joi.array().items(Joi.string().min(1)).min(1).required(),
  // startDate: Joi.date().required(),
  // endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
  //     'date.greater': 'End date must be after start date'
  // }),
  //status: Joi.string().valid('active', 'inactive').default('active'),
  // inactiveUnitl: Joi.when('status', {
  //     is: 'inactive',
  //     then: Joi.date().required(),
  //     otherwise: Joi.forbidden()
  // })
});

const validateCreateGoal = (req, res, next) => {
  console.log(req.body);
  const { error } = createGoalSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

const updateGoalDetailsSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
})
  .min(1)
  .custom((value, helpers) => {
    const { startDate, endDate } = value;

    if (startDate && endDate && endDate <= startDate) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid": "End date must be after start date",
  });

const validateUpdateGoalDetails = (req, res, next) => {
  console.log(req.body);
  const { error } = updateGoalDetailsSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

const addStepSchema = Joi.object({
  content: Joi.string().trim().min(3).max(500).required().messages({
    "string.empty": "Step content cannot be empty",
    "string.min": "Step content must be at least 3 characters long",
    "any.required": "Step content is required",
  }),
});

const validateStep = (req, res, next) => {
  console.log(req.body);
  const { error } = addStepSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

const updateGoalSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
  isactiveUntil: Joi.when("status", {
    is: "inactive",
    then: Joi.date().required(),
    otherwise: Joi.forbidden(),
  }),
});

const validateUpdateGoalStatus = (req, res, next) => {
  console.log(req.body);
  const { error } = updateGoalSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

const updateStepSchema = Joi.object({
  completed: Joi.boolean().required(),
});

const validateUpdateStep = (req, res, next) => {
  console.log(req.body);
  const { error } = updateStepSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateCreateGoal,
  validateUpdateGoalDetails,
  validateStep,
  validateUpdateGoalStatus,
  validateUpdateStep,
};
