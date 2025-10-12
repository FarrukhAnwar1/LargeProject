const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  UserId: {
    type: Number,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Login: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("User", UserSchema, "Users");
module.exports = User;