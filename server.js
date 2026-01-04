const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db_connection = require("./config/db.coonection");
const registerRoute = require("./src/modules/user_module/user_route");
const path = require("path");

app.use(express.json());
db_connection();

app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.use("/student", registerRoute);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
