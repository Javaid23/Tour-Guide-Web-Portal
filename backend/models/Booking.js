import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: false,
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function(v) {
          // Allow past dates for testing or administrative bookings
          return v && !isNaN(v.getTime());
        },
        message: "Start date must be a valid date"
      }
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function(v) {
          return v > this.startDate;
        },
        message: "End date must be after start date"
      }
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "At least 1 person is required"],
      max: [50, "Maximum 50 people allowed"]
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"]
    },
    basePrice: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    discounts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed", "refunded"],
        message: "Status must be pending, confirmed, cancelled, completed, or refunded"
      },
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded", "partial"],
        message: "Payment status must be pending, paid, failed, refunded, or partial"
      },
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "jazzcash", "easypaisa", "stripe"],
    },
    paymentReference: {
      type: String,
    },
    // Additional payment fields for Stripe integration
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    stripePaymentIntentId: {
      type: String,
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"]
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"]
    },
    customerInfo: {
      contactPerson: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      }
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"]
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
)

// Custom validation: require at least one of tour or destination
bookingSchema.pre('validate', function(next) {
  if (!this.tour && !this.destination) {
    this.invalidate('tour', 'Either tour or destination is required');
    this.invalidate('destination', 'Either tour or destination is required');
  }
  next();
});

// Compound indexes for better query performance
bookingSchema.index({ user: 1, status: 1 })
bookingSchema.index({ tour: 1, startDate: 1 })
bookingSchema.index({ status: 1, paymentStatus: 1 })
bookingSchema.index({ startDate: 1, endDate: 1 })
bookingSchema.index({ createdAt: -1 })
bookingSchema.index({ bookingReference: 1 }, { unique: true })

// Virtual for booking duration in days
bookingSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days until tour starts
bookingSchema.virtual('daysUntilTour').get(function() {
  if (this.startDate) {
    const diffTime = this.startDate - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for booking status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    // Generate booking reference: BK + timestamp + random
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.bookingReference = `BK${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate total price
bookingSchema.pre('save', function(next) {
  if (this.isModified('basePrice') || this.isModified('taxes') || this.isModified('discounts') || this.isModified('numberOfPeople')) {
    const subtotal = this.basePrice * this.numberOfPeople;
    this.totalPrice = subtotal + (this.taxes || 0) - (this.discounts || 0);
  }
  next();
});

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const daysBefore = this.daysUntilTour;
  return this.status === 'confirmed' && daysBefore > 1;
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (this.status !== 'cancelled') return 0;
  
  const daysBefore = this.daysUntilTour;
  let refundPercentage = 0;
  
  if (daysBefore > 7) {
    refundPercentage = 0.9; // 90% refund
  } else if (daysBefore > 3) {
    refundPercentage = 0.5; // 50% refund
  } else if (daysBefore > 1) {
    refundPercentage = 0.25; // 25% refund
  }
  
  return this.totalPrice * refundPercentage;
};

// Static method for booking analytics
bookingSchema.statics.getBookingStats = async function(dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        averageBookingValue: { $avg: "$totalPrice" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to find upcoming bookings
bookingSchema.statics.findUpcoming = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    startDate: { 
      $gte: new Date(),
      $lte: futureDate 
    },
    status: { $in: ['confirmed', 'pending'] }
  })
  .populate('user', 'name email phone')
  .populate('tour', 'title location')
  .sort({ startDate: 1 });
};

export default mongoose.model("Booking", bookingSchema)
