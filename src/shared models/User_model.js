const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, minlength: 5, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 6, required: true },
    username: { type: String, minlength: 2, required: true },
    phone: { type: String, minlength: 10, required: false },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
