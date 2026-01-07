const mongoose = require("mongoose");

const StreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    startDate: { type: Date },
    endDate: { type: Date },
    completedDates: { type: [Date], default: [] },
    completedWeeks: { type: [Date], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Streak", StreakSchema);
