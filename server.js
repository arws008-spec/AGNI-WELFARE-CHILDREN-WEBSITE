// ================= IMPORTS =================
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("./admin");
const Login = require("./login");
const Register = require("./register");
const Donation = require("./Donation");
const NCCApplication = require("./NCCApplication");
const ARWS = require("./arws");

// ================= APP =================
const app = express();
app.use(cors());
app.use(express.json());

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ================= RAZORPAY =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================= CREATE ORDER =================
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
});

// ================= SAVE DONATION =================
app.post("/save-donation", async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();

    res.json({
      success: true,
      message: "Donation saved successfully"
    });
  } catch (err) {
    console.error("Donation save error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save donation"
    });
  }
});

// ================= HEALTH CHECK (OPTIONAL) =================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.post("/api/ncc-application", async (req, res) => {
  try {
    const application = new NCCApplication(req.body);
    await application.save();

    res.json({
      success: true,
      applicationId: application._id
    });
  } catch (err) {
    console.error("NCC save error:", err);
    res.status(500).json({ success: false, message: "Failed to submit application" });
  }
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, username, email, permanentaddress, bloodgroup, password } = req.body;

    const user = new Register({
      fullname,
      username,
      email,
      permanentaddress,
      bloodgroup,
      password
    });

    await user.save();

    res.json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Register failed" });
  }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const login = new Login({
      username,
      password
    });

    await login.save();

    res.json({
      success: true,
      message: "Login data saved"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// ================= ADMIN LOGIN =================
app.post("/api/admin-login", async (req, res) => {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = req.body;

    const admin = new Admin({
      ADMIN_USERNAME,
      ADMIN_PASSWORD
    });

    await admin.save();

    res.json({
      success: true,
      message: "Admin login saved"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Admin login failed" });
  }
});

// ================= ARWS CADET APPLICATION =================
app.post("/api/arws-application", async (req, res) => {
  try {

    const application = new ARWS(req.body);

    await application.save();

    res.json({
      success: true,
      message: "ARWS Application submitted successfully",
      applicationId: application._id
    });

  } catch (error) {
    console.error("ARWS save error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application"
    });
  }
});
