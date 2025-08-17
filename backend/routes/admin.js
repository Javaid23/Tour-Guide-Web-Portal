import express from "express"
import User from "../models/User.js"
import Tour from "../models/Tour.js"
import Booking from "../models/Booking.js"
import Review from "../models/Review.js"
import TourGuide from "../models/TourGuide.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Middleware to check admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Get dashboard stats - OPTIMIZED VERSION
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching optimized admin dashboard stats...')
    
    // Use Promise.all for parallel execution and aggregation for better performance
    const [
      totalUsers,
      totalTours,
      totalBookings,
      totalReviews,
      monthlyRevenue,
      prevMonthRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Tour.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      
      // Calculate current month revenue using aggregation (much faster)
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" }
          }
        }
      ]),
      
      // Calculate previous month revenue using aggregation
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" }
          }
        }
      ])
    ])

    const currentRevenue = monthlyRevenue[0]?.total || 0
    const previousRevenue = prevMonthRevenue[0]?.total || 0
    
    // Calculate growth percentage
    const monthlyGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
      : 0

    console.log('✅ Optimized stats calculated:', {
      totalUsers,
      totalTours,
      totalBookings,
      totalReviews,
      monthlyRevenue: currentRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
    })

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTours,
        totalBookings,
        totalReviews,
        monthlyRevenue: currentRevenue,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    })
  }
})

// List users (with optional filters/search) - OPTIMIZED
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching users with pagination...')
    const { search, role, isActive, page = 1, limit = 20 } = req.query
    
    const query = {}
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive === "true"
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ]
    }

    // Use Promise.all for parallel execution
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password -emailVerificationToken -passwordResetToken -resetPasswordToken")
        .lean(), // Use lean() for better performance
      User.countDocuments(query)
    ])

    console.log(`✅ Fetched ${users.length} users (page ${page}/${Math.ceil(total/limit)})`)
    
    res.json({ 
      success: true,
      data: { users, total },
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    })
  }
})

// List all tours/destinations (with filters/search, pagination)
router.get("/tours", auth, requireAdmin, async (req, res) => {
  try {
    const { search, category, isActive, page = 1, limit = 20 } = req.query;
    const query = {};
    // Only filter by isActive if explicitly provided
    if (isActive === "true" || isActive === "false") {
      query["availability.isActive"] = isActive === "true";
    }
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "destinations.location": { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const tours = await Tour.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Tour.countDocuments(query);
    res.json({ 
      success: true,
      tours, 
      total 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// List all bookings (with filters/search, pagination) - OPTIMIZED
router.get("/bookings", auth, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching bookings with pagination...')
    const { search, status, tour, user, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (tour) query.tour = tour;
    if (user) query.user = user;
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }

    // Use Promise.all for parallel execution
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("user", "name email")
        .populate("tour", "name title")
        .populate("destination", "name price duration location")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(), // Use lean() for better performance
      Booking.countDocuments(query)
    ])

    // Debug: Log destination object for each booking
    bookings.forEach((b, i) => {
      if (b.destination) {
        console.log(`Booking[${i}] destination:`, b.destination);
        if (typeof b.destination === 'object' && b.destination !== null) {
          console.log(`Booking[${i}] destination.name:`, b.destination.name);
        }
      } else {
        console.log(`Booking[${i}] has no destination`);
      }
    });

    console.log(`✅ Fetched ${bookings.length} bookings (page ${page}/${Math.ceil(total/limit)})`)
    
    res.json({ 
      success: true,
      data: { bookings, total },
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// List all reviews (with filters/search, pagination)
router.get("/reviews", auth, requireAdmin, async (req, res) => {
  try {
    const { search, status, tour, user, page = 1, limit = 20 } = req.query;
    const query = {};
    if (tour) query.tour = tour;
    if (user) query.user = user;
    if (status) query.status = status; // e.g. "pending", "approved", "hidden"
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ];
    }
    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("tour", "name title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments(query);
    res.json({ 
      success: true,
      reviews, 
      total 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve/hide a review (status change only)
router.patch("/reviews/:id/status", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "approved", "hidden"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Update booking status (confirm, complete, cancel, refund)
router.patch("/bookings/:id/status", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled", "refunded"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// System health check
router.get("/health", auth, requireAdmin, async (req, res) => {
  try {
    res.json({ 
      success: true,
      status: "ok", 
      time: new Date(),
      message: "Admin API is working"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: "error" 
    });
  }
});

export default router
