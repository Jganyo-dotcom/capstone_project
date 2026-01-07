const cron = require("node-cron");
const {
  sendDailyNoti,
  sendWeeklyNoti,
} = require("../modules/notification & reward module/noti_validation");

// Every day at midnight (00:00)
// cron.schedule("0 0 * * *", () => {
//   console.log("Running daily notification job...");
//   sendDailyNoti();
// });

// Every 15 minutes
cron.schedule("*/14 * * * *", () => {
  console.log("Running notification job...");
  sendDailyNoti();
});

// Every Sunday at midnight
cron.schedule("*/15 * * * *", () => {
  console.log("Running weekly notification job...");
  sendWeeklyNoti();
});
// // Every hour at minute 0
// cron.schedule("0 * * * *", () => {
//   console.log("Running notification job...");
//   sendDailyNoti();
// });
