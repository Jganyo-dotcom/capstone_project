const UserSchema = require("../../shared models/User_model");
const {
  validationForRegisterSchema,
  validationForLogin,
} = require("./user_validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerNewUser = async (req, res) => {
  const { error, value } = validationForRegisterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // find email is existing
  const existing_user = await UserSchema.findOne({ email: value.email });
  if (existing_user) {
    return res.status(400).json({ message: "email already exist" });
  }
  const existing_username = await UserSchema.findOne({
    username: value.username,
  });
  if (existing_username) {
    return res.status(400).json({ message: "username already taken" });
  }

  try {
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(value.password, salt);

    // go on to register user
    const User_info = new UserSchema({
      email: value.email,
      name: value.name,
      username: value.username,
      role: "student",
      password: hashed_password,
      phone: value.phone,
    });
    await User_info.save();
    //send back the user
    const newUser = {
      email: value.email,
      name: value.name,
      username: value.username,
      phone: value.phone,
    };
    res.status(201).json({ message: "user successfully registered", newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "something went wrong if error persists kindly contact the administrator",
    });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { error, value } = validationForLogin.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let tryingToLoginUser;
    if (value.main.includes("@")) {
      //find the user
      tryingToLoginUser = await UserSchema.findOne({ email: value.main });
    } else {
      tryingToLoginUser = await UserSchema.findOne({
        username: value.main,
      });
    }

    if (!tryingToLoginUser) {
      res.status(404).json({ message: "user not found" });
    }
    //compare passwords and login
    const compare_passwords = await bcrypt.compare(
      value.password,
      tryingToLoginUser.password
    );
    if (!compare_passwords) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: tryingToLoginUser._id,
        name: tryingToLoginUser.name,
        email: tryingToLoginUser.email,
        role: tryingToLoginUser.role,
        username: tryingToLoginUser.username,
        phone: tryingToLoginUser.phone,
      },
      process.env.JWT_SECRETE,
      { expiresIn: process.env.EXPIRES_IN }
    );

    const safe_user = {
      id: tryingToLoginUser._id,
      name: tryingToLoginUser.name,
      username: tryingToLoginUser.username,
      email: tryingToLoginUser.email,
      role: tryingToLoginUser.role,
      phone: tryingToLoginUser.phone,
    };

    //if password is right
    res.status(200).json({
      message: "login was successful",
      safe_user,
      token,
      vapidPublicKey: process.env.publicKey,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong while logging in" });
  }
};

module.exports = { registerNewUser, LoginUser };
