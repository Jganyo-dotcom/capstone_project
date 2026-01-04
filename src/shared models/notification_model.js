const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["encouragement", "reminder", "milestone", "recovery"],
      required: true,
    },
    reminders_timeline:{ type: String, enum: ["Daily", "weekly"], default: "Daily" },
    reminders_timeline:{ type: String, enum: ["Daily", "weekly"], default: "Daily" },
    content: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    deliveredAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
