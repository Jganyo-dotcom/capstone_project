const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    enum: ["Daily", "Weekly"],
    default: "Daily",
  },
  subscription: {
    type: Object,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    inactiveUntil: Date,
    lastNotifiedStep: { type: Number, default: 0 },
    completedSteps: { type: [Date], default: [] },
    completedWeeks: { type: [Date], default: [] },
    steps: [stepSchema],
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

module.exports = Goal;
