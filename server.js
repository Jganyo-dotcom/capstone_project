const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db_connection = require("./config/db.coonection");
const registerRoute = require("./src/modules/user_module/user_route");
const streakAdminRoutes = require ('./src/modules/streak_engine_module/admin_route');
const streakStudentRoutes = require ('./src/modules/streak_engine_module/studentStreak_route');


app.use(express.json());
db_connection();

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.use("/student", registerRoute, streakAdminRoutes, streakStudentRoutes);

app.use('/admin/streak', streakAdminRoutes);

app.use('/streak', streakStudentRoutes);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
