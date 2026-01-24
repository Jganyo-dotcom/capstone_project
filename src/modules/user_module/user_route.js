const express = require("express");
const {
  LoginUser,
  registerNewUser,
  changePassword,
  editMyProfile,
} = require("./user_controller");
const authmiddleware = require("../../middlewares/auth");
const router = express.Router();

router.post("/login", LoginUser);
router.post("/register", registerNewUser);
router.post("/reset-password", authmiddleware, changePassword);
router.patch("/update-profile", authmiddleware, editMyProfile);

module.exports = router;
