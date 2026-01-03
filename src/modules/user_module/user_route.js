const express = require("express");
const { LoginUser, registerNewUser } = require("./user_controller");
const router = express.Router();

router.post("/login", LoginUser);
router.post("/register", registerNewUser);

module.exports = router;
