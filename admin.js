const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  ADMIN_USERNAME: String,                  
  ADMIN_PASSWORD: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Admin", AdminSchema);