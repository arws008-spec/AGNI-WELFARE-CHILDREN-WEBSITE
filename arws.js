const mongoose = require("mongoose");

const ARWSSchema = new mongoose.Schema({
  name: String,
  gender: String,

  fatherName: String,
  fatherOccupation: String,
  fatherIncome: String,

  motherName: String,
  motherOccupation: String,
  motherIncome: String,

  guardianName: String,

  aadhaarNumber: String,
  panNumber: String,

  address: String,
  citizenship: String,

  village: String,
  tehsil: String,
  district: String,
  pincode: String,
  postOffice: String,
  railwayStation: String,

  education: String,
  dob: Date,
  school: String,
  training: String,

  residentialAddress: String,
  contactNumber: String,
  email: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ARWS", ARWSSchema);