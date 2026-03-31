// ================= IMPORTS =================
const bcrypt = require("bcrypt");
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
app.use(cors({
  origin: [
    "https://agniruralwelfaresociety.org.in",
    "https://www.agniruralwelfaresociety.org.in",
    "https://gorgeous-duckanoo-3c12fd.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.get("/api", (req, res) => {
  res.json({
    status: "API running",
    server: "AGNI RURAL WELFARE BACKEND"
  })
});

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

    res.json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID
    });
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
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { name, email, password } = req.body;

    const user = new Register({
      fullname: name,
      username: name,
      email: email,
      permanentaddress: "",
      bloodgroup: "",
      password: password
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
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const login = new Login({
      username,
      password
    });

    await login.save();

    res.json({
      success: true,
      user: {
        id: login._id,
        name: username
      }
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

    if (ADMIN_USERNAME === "Arws2026" && ADMIN_PASSWORD === "Arws@2026") {
      return res.json({ success: true });
    }

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

