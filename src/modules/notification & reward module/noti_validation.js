const notiSchema = require("../../shared models/notification_model");
const GoalSchema = require("../../shared models/goal.model");
const wp = require("web-push");

wp.setVapidDetails(
  "mailto:elikemejay@gmail.com",
  process.env.public_Key,
  process.env.private_key
);

async function sendDailyNoti() {
  try {
    const dailySteps = await GoalSchema.find({ "steps.length": "Daily" });
    for (const step of dailySteps) {
      const payload = JSON.stringify({
        title: "Daily Step reminder",
        body: `Your step ${step} is waiting on your to be completed`,
        data: { url: `/steps/${step._id}` },
      });
      await wp.sendNotification(step.subscription, payload);
      console.log(`Daily notification sent to user ${step.userId}`);
    }
  } catch (err) {
    console.log(err);
  }
}

async function sendWeekNoti() {
  try {
    const weeklySteps = await GoalSchema.find({ "steps.length": "weekly" });
    for (const step of weeklySteps) {
      const payload = JSON.stringify({
        title: "weekly Step reminder",
        body: `Your step ${step} is waiting on your to be completed`,
        data: { url: `/steps/${step._id}` },
      });
      await wp.sendNotification(step.subscription, payload);
      console.log(`Daily notification sent to user ${step.userId}`);
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { sendDailyNoti, sendWeekNoti };
