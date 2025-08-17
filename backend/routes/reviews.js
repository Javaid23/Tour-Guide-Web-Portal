import express from "express"
import mongoose from "mongoose"
import Review from "../models/Review.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Test endpoint to check if reviews route is working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Reviews route is working" });
});

// Get reviews for a tour
router.get("/tour/:tourId", async (req, res) => {
  try {
    const reviews = await Review.find({ tour: req.params.tourId }).populate("user", "name").sort({ createdAt: -1 })
    res.json(reviews)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create review - SIMPLIFIED FOR DEBUGGING
router.post("/", auth, async (req, res) => {
  try {
    console.log("📥 POST /api/reviews - Request received");
    console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
    console.log("👤 User from auth middleware:", req.user);
    
    // Basic validation
    const { tour, rating, comment, travelDate } = req.body;
    
    if (!tour || !rating || !comment || !travelDate) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    console.log("✅ Basic validation passed");
    
    // Test MongoDB connection
    const connectionState = mongoose.connection.readyState;
    console.log("🔗 MongoDB connection state:", connectionState);
    
    if (connectionState !== 1) {
      console.log("❌ MongoDB not connected");
      return res.status(500).json({ message: "Database connection error" });
    }
    
    console.log("✅ MongoDB connected, creating review...");
    
    // Create review object
    const reviewData = {
      user: req.user.userId,
      tour,
      rating: parseInt(rating),
      comment: comment.trim(),
      travelDate: new Date(travelDate)
    };
    
    console.log("📝 Review data to save:", reviewData);
    
    const review = new Review(reviewData);
    console.log("✅ Review instance created");
    
    await review.save();
    console.log("✅ Review saved to database");
    
    await review.populate("user", "name");
    console.log("✅ Review populated");
    
    res.status(201).json(review);
    console.log("✅ Response sent successfully");
    
  } catch (error) {
    console.error('❌❌❌ CRITICAL ERROR in POST /api/reviews ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: "Server error occurred",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update review
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, {
      new: true,
    }).populate("user", "name")

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }
    res.json(review)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete review
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    })
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }
    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's own reviews
router.get("/my", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.userId })
      .populate("tour", "name")
      .populate("user", "name")
      .sort({ createdAt: -1 })
    res.json({ success: true, data: reviews })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
