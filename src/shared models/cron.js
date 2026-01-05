const cron = require("node-cron");
const {
  sendDailyNoti,
  sendWeekNoti,
} = require("../modules/notification & reward module/noti_validation");

cron.schedule("0 0 * * * *", () => {
  console.log("Running notification job...");
  sendDailyNoti();
});

cron.schedule("0 0 * * 0", () => {
  console.log("Running notification job...");
  sendWeekNoti();
});
