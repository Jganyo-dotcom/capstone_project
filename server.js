const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db_connection = require("./config/db.coonection");
const registerRoute = require("./src/modules/user_module/user_route");
const path = require("path");
const notiRoute = require("./src/modules/notification & reward module/noti_route");
const CreateRoute = require("./src/modules/Goal_managent_module/student_goal_route");
const { registerAdminfunction } = require("./src/modules/user_module/admin.setup");
require("./src/shared models/cron");

app.use(express.json());
db_connection();
registerAdminfunction()
app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.use("/student", registerRoute);
app.use("/student/create", CreateRoute);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
