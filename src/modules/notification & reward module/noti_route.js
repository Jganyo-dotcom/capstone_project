const express = require("express");
const {
  sendDailyNoti,
  sendWeeklyNoti,
  createGoal,
  clearGoals,
} = require("./noti_validation");
const router = express.Router();

const wp = require("web-push");
const authmiddleware = require("../../middlewares/auth");
router.post("/goals", authmiddleware, createGoal);
router.post("/notify-me-daily", authmiddleware, sendDailyNoti); // send the noti
router.post("/notify-me-weekly", authmiddleware, sendWeeklyNoti);
router.delete("/goals/clear", clearGoals);

module.exports = router;
