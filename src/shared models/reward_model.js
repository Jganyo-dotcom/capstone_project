const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["streak", "goal", "milestone"], // categories of rewards
    required: true,
  },
  description: { type: String, required: true }, // human-readable message
  unlockedAt: { type: Date, default: Date.now }, // when reward was unlocked
  metadata: { type: Object }, // optional: store streak length, goalId, etc.
});

module.exports = mongoose.model("Reward", rewardSchema);
