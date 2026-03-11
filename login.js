const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  username: String,                  
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Login", LoginSchema);