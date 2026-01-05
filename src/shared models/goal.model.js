const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  frequency: { type: String, enum: ["Daily", "weekly"], default: "Daily" },
  subscription: { type: String, required: true },
});

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    StartDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    steps: [StepSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", GoalSchema);
