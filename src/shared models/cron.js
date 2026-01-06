const cron = require("node-cron");
const {
  sendDailyNoti,
  sendWeeklyNoti,
} = require("../modules/notification & reward module/noti_validation");

// Every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("Running notification job...");
  sendDailyNoti();
});

// Every Sunday at midnight
cron.schedule("0 0 * * 0", () => {
  console.log("Running weekly notification job...");
  sendWeeklyNoti();
});
// // Every hour at minute 0
// cron.schedule("0 * * * *", () => {
//   console.log("Running notification job...");
//   sendDailyNoti();
// });
