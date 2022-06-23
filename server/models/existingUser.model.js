const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const existingUserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const existingUser = mongoose.model("userLogin", existingUserSchema);

module.exports = existingUser;
