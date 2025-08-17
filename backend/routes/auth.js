import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import auth from "../middleware/auth.js"
import path from "path"
import fs from "fs"
import { verifyGoogleToken, getGoogleUserFromAuthCode } from "../utils/googleAuth.js"
import { sendEmail } from "../utils/emailService.js"
import crypto from "crypto"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      countryCode,
      password, 
      dateOfBirth,
      nationality 
    } = req.body

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields: firstName, lastName, email, phone, and password" 
      })
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid email address" 
      })
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long" 
      })
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{7,15}$/
    const cleanPhone = phone.replace(/\s/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid phone number" 
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { phone: cleanPhone }
      ]
    })
    
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone number'
      return res.status(400).json({ 
        success: false,
        message: `User with this ${field} already exists` 
      })
    }

    // Create user data object
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone: cleanPhone,
      countryCode: countryCode || "+1",
      password,
    }

    // Add optional fields if provided
    if (dateOfBirth) {
      userData.dateOfBirth = new Date(dateOfBirth)
    }
    if (nationality) {
      userData.nationality = nationality
    }

    // Create user
    const user = new User(userData)
    await user.save()

    // Send welcome email
    try {
      await sendEmail(
        user.email,
        "Welcome to TourGuide!",
        `<h2>Welcome, ${user.firstName}!</h2><p>Thank you for signing up. Enjoy exploring tours in Pakistan!</p>`
      );
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    // Create token with user role
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to Pakistan Tours!",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      })
    }

    // Check if user exists and explicitly select password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      })
    }

    // Create token with user role
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    })
  }
})

// Google Sign-In (auth code flow)
router.post("/google-login", async (req, res) => {
  try {
    console.log("/google-login body:", req.body);
    const { authCode } = req.body;
    if (!authCode) {
      return res.status(400).json({ success: false, message: "No Google auth code provided" });
    }
    // Exchange code for tokens and verify
    const { payload } = await getGoogleUserFromAuthCode(authCode);
    console.log("Google payload email:", payload.email);
    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    console.log("User found in DB:", user);
    let isNewUser = false;
    if (!user) {
      // Determine role based on email
      const isAdmin = payload.email.toLowerCase() === 'javaidbutt009@gmail.com';
      
      user = new User({
        firstName: payload.given_name || payload.name?.split(' ')[0] || 'Google',
        lastName: payload.family_name || payload.name?.split(' ')[1] || '',
        email: payload.email,
        password: Math.random().toString(36).slice(-8) + Date.now(),
        role: isAdmin ? 'admin' : 'user', // Auto-assign admin role for your email
        // Do NOT set phone or countryCode so frontend can prompt for them
        avatar: payload.picture || undefined,
      });
      await user.save();
      isNewUser = true;
      console.log(`Google user created with role: ${user.role} for email: ${user.email}`);
      
      // Send welcome email
      try {
        await sendEmail(
          user.email,
          "Welcome to TourGuide!",
          `<h2>Welcome, ${user.firstName}!</h2><p>Thank you for signing up with Google. Enjoy exploring tours in Pakistan!</p>`
        );
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }
    } else {
      // Update existing user to admin if it's your email and not already admin
      if (payload.email.toLowerCase() === 'javaidbutt009@gmail.com' && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`Updated existing user to admin role for email: ${user.email}`);
      }
    }
    // Create JWT with user role
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.json({
      success: true,
      message: isNewUser ? "Google sign-up successful" : "Google login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error("/google-login error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: "Google login failed", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
})

// Forgot Password - send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 1000 * 60 * 30; // 30 min
    user.resetPasswordToken = token;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();
    // Send email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail(
      user.email,
      "Reset your password",
      `<p>Click the link below to reset your password. This link is valid for 30 minutes.</p><a href='${resetUrl}'>Reset Password</a>`
    );
    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("/forgot-password error:", error);
    
    // Better error handling for email issues
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      return res.status(500).json({ 
        success: false, 
        message: "Email service is temporarily unavailable. Please try again later or contact support." 
      });
    }
    
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ 
        success: false, 
        message: "Email service connection failed. Please try again later." 
      });
    }
    
    res.status(500).json({ success: false, message: "Unable to send reset email. Please contact support." });
  }
});

// Reset Password - set new password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: "Token and new password are required" });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    await sendEmail(user.email, "Password Reset Successful", `<p>Your password has been changed successfully.</p>`);
    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("/reset-password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
