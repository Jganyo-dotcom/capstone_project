const express = require("express");
const { sendDailyNoti, sendWeekNoti } = require("./noti_validation");
const router = express.Router();

const wp = require("web-push");

// Test push route
router.post("/test-push", async (req, res) => {
  try {
    const subscription = req.body; // frontend sends subscription object
    const payload = JSON.stringify({
      title: "Test Notification",
      body: "This is just a test push!",
      data: { url: "/" },
    });

    await wp.sendNotification(subscription, payload);
    res.json({ message: "Test push sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.post("/notify-me-daily", sendDailyNoti); // send the noti
router.post("/notify-me-weekly", sendWeekNoti);

module.exports = router;
