const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["badge", "milestone"], required: true },
    milestoneDays: { type: Number, required: true },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
