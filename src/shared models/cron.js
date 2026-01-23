const cron = require("node-cron");
const {
  sendDailyNoti,
  sendWeeklyNoti,
  sendDailyNotisecond,
  sendDailymoti,
} = require("../modules/notification & reward module/controller");

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

// At 6:00 and 10:00 every day
cron.schedule("0 6,10 * * *", () => {
  console.log("Running notification job at 6am or 10am...");
  sendDailyNoti();
});

// At 15:00 every day
cron.schedule("0 15 * * *", () => {
  console.log("Running notification job at 3pm...");
  sendDailyNotisecond();
});

// At 20:00 every day
cron.schedule("0 20 * * *", () => {
  console.log("Running notification job at 8pm...");
  sendDailymoti();
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
