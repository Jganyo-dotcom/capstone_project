const Joi = require("joi");

const createGoalSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().trim(),

  startDate: Joi.date().required(),
  endgoal: Joi.date().greater(Joi.ref("startDate")).required().messages({
    "date.greater": "End date must be after start date",
  }),

  status: Joi.string().valid("active", "inactive").default("active"),

  inactiveUntil: Joi.when("status", {
    is: "inactive",
    then: Joi.date().required(),
    otherwise: Joi.forbidden(),
  }),

  steps: Joi.array()
    .items(
      Joi.object({
        index: Joi.number().integer().min(0).required(),
        name: Joi.string().min(1).required(),
        frequency: Joi.string().valid("Daily", "Weekly").required(),
        subscription: Joi.object({
          endpoint: Joi.string().uri().required(),
          expirationTime: Joi.date().allow(null), // ✅ matches Push API
          keys: Joi.object({
            p256dh: Joi.string().required(),
            auth: Joi.string().required(),
          }).required(),
        }).required(),
      })
    )
    .min(1)
    .required(),
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
