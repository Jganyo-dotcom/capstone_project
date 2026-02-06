const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db_connection = require("./config/db.coonection");
const registerRoute = require("./src/modules/user_module/user_route");
const path = require("path");
const morgan = require("morgan");
const notiRoute = require("./src/modules/notification & reward module/noti_route");
const CreateRoute = require("./src/modules/Goal_managent_module/student_goal_route");
const streakRoute = require("./src/modules/streak_engine_module/student_route");
require("./src/shared models/cron");
const cors = require("cors");

// npm install cors


app.use(
  cors({
    origin: ["https://focuset.netlify.app", "http://localhost:5173"], // allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // allow bearer token header
    credentials: true, // if you want cookies or auth headers to be sent
  }),
);



app.use(morgan("dev"));
app.use(express.json());
db_connection();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.use("/student", registerRoute);
app.use("/student/create", CreateRoute);
app.use("/student", streakRoute);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
