const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },

    // Badge / Medal / Trophy
    type: { type: String, enum: ["badge", "medal", "trophy"], required: true },

    // Name of the reward
    name: { type: String, required: true },

    // Criteria for unlocking
    criteria: {
      streakLength: { type: Number }, // e.g. 7-day streak
      noBreaks: { type: Boolean }, // true if streak must be continuous
      goalsCompleted: { type: Number }, // e.g. 2 goals completed
    },

    unlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
