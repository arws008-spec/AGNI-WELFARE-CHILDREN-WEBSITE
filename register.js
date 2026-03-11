const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema({
  fullname: String,
  username: String,
  email: String,
  permanentaddress: String,
  bloodgroup: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Register", RegisterSchema);
