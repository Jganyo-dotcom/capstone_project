const mongoose = require("mongoose");

const StreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    currentStreakDays: { type: Number, default: 0 },
    longestStreakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    history: [
      {
        startDate: { type: Date },
        endDate: { type: Date },
        length: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Streak", StreakSchema);
