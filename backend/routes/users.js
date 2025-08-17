import express from "express"
import User from "../models/User.js"
import auth from "../middleware/auth.js"
// Added for avatar upload
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const router = express.Router()

// Avatar upload storage (new)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const avatarDir = path.join(__dirname, '../public/uploads/avatars')
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true })

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
    cb(null, 'avatar-' + unique + path.extname(file.originalname))
  }
})
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase())
    const mimeOk = allowed.test(file.mimetype)
    if (extOk && mimeOk) return cb(null, true)
    cb(new Error('Only image files (jpg,jpeg,png,webp) are allowed'))
  }
})

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile (now supports optional avatar URL)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone, address, contact, avatar } = req.body
    const updateData = { name, phone: phone || contact, address }
    if (avatar && /^https?:\/\//.test(avatar)) {
      updateData.avatar = avatar
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json({ success: true, data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// New: upload avatar image file
router.put('/profile/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
    const fileUrl = `/uploads/avatars/${req.file.filename}`
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: fileUrl },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ success: false, message: err.message || 'Avatar upload failed' })
  }
})

// Change password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" })
    }

    console.log("🔐 Password change request for user:", req.user.userId);

    const user = await User.findById(req.user.userId).select('+password')
    if (!user) {
      console.log(" User not found:", req.user.userId);
      return res.status(404).json({ success: false, message: "User not found" })
    }

    console.log(" User found, comparing passwords...");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      console.log(" Current password incorrect");
      return res.status(400).json({ success: false, message: "Current password is incorrect" })
    }

    console.log(" Current password verified, updating to new password...");

    // Update password
    user.password = newPassword
    await user.save()

    console.log(" Password updated successfully");
    res.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error(" Password change error:", error)
    res.status(500).json({ success: false, message: "Server error during password change", error: error.message })
  }
})

// Delete user account
router.delete("/profile", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId)
    res.json({ success: true, message: "Account deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Complete profile after Google sign-up (or for missing info)
router.put("/complete-profile", auth, async (req, res) => {
  try {
    const { phone, countryCode } = req.body
    if (!phone || !countryCode) {
      return res.status(400).json({ message: "Phone and country code are required." })
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { phone, countryCode },
      { new: true, runValidators: true },
    ).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
