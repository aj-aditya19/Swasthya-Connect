const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOtp, storeOtp, verifyOtp } = require("../utils/otpStore");
const { sendOtpEmail } = require("../utils/mailer");
const { protect } = require("../middleware/auth");
const {
  PricingV2TrunkingCountryInstanceOriginatingCallPrices,
} = require("twilio/lib/rest/pricing/v2/country");

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      age,
      gender,
      bloodGroup,
      preferredLanguage,
    } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: undefined,
      passwordHash,
      phone,
      age,
      gender,
      bloodGroup,
      preferredLanguage,
      isVerified: false,
    });

    const otp = generateOtp();
    storeOtp(email, otp);
    await sendOtpEmail(email, otp, name);

    res.status(201).json({
      message: "OTP sent to your email. Verify to complete registration.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      console.log("OTP and Email both are required");
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const result = verifyOtp(email, otp);
    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id);
    res.json({ message: "Email verified successfully", token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOtp();
    storeOtp(email, otp);
    await sendOtpEmail(email, otp, user.name);
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Email not verified. Please register again." });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const otp = generateOtp();
    storeOtp(email, otp);
    await sendOtpEmail(email, otp, user.name);
    res.json({ message: "OTP sent to your email", email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = verifyOtp(email, otp);
    if (!result.valid) return res.status(400).json({ message: result.reason });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "-passwordHash",
    );
    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, age, gender, bloodGroup, address, preferredLanguage } =
      req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, age, gender, bloodGroup, address, preferredLanguage },
      { new: true },
    ).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
