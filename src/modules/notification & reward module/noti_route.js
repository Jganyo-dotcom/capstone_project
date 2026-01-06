const express = require("express");
const {
  sendDailyNoti,
  sendWeeklyNoti,
} = require("./noti_validation");
const router = express.Router();

const wp = require("web-push");
const authmiddleware = require("../../middlewares/auth");

router.post("/notify-me-daily", authmiddleware, sendDailyNoti); // send the noti
router.post("/notify-me-weekly", authmiddleware, sendWeeklyNoti);


module.exports = router;
