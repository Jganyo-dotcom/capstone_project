const express = require("express");
const { updateStreak, getStreaks } = require("./streak_controller");
const authmiddleware = require("../../middlewares/auth");
const router = express.Router();

router.get("/goal/:goalId/step/:stepIndex/done", authmiddleware, updateStreak);
router.get("/streaks/ALL/:goalId", authmiddleware, getStreaks);

module.exports = router;
