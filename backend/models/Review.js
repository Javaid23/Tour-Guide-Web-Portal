import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
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
      required: [true, "Tour is required"],
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number"
      }
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      trim: true,
    },
    title: {
      type: String,
      maxlength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    aspects: {
      guide: {
        type: Number,
        min: 1,
        max: 5,
      },
      accommodation: {
        type: Number,
        min: 1,
        max: 5,
      },
      transportation: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      organization: {
        type: Number,
        min: 1,
        max: 5,
      }
    },
    photos: [{
      url: {
        type: String,
        validate: {
          validator: function(v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Photo URL must be valid"
        }
      },
      caption: String,
    }],
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminNotes: {
      type: String,
      maxlength: [500, "Admin notes cannot exceed 500 characters"]
    },
    travelDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: "Travel date cannot be in the future"
      }
    },
    travelType: {
      type: String,
      enum: ["solo", "couple", "family", "friends", "business"],
      default: "solo"
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
)

// Compound indexes for better performance
reviewSchema.index({ tour: 1, rating: -1 })
reviewSchema.index({ user: 1, tour: 1 }, { unique: true }) // One review per user per tour
reviewSchema.index({ isVerified: 1, isHidden: 1, rating: -1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ helpfulVotes: -1 })

// Virtual for review age in days
reviewSchema.virtual('reviewAge').get(function() {
  if (this.createdAt) {
    const diffTime = Math.abs(new Date() - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for overall aspect rating
reviewSchema.virtual('aspectsAverage').get(function() {
  if (!this.aspects) return null;
  
  const aspectValues = Object.values(this.aspects).filter(val => val !== null && val !== undefined);
  if (aspectValues.length === 0) return null;
  
  const sum = aspectValues.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / aspectValues.length) * 10) / 10;
});

// Virtual for review summary
reviewSchema.virtual('summary').get(function() {
  const maxLength = 100;
  if (this.comment && this.comment.length > maxLength) {
    return this.comment.substring(0, maxLength) + '...';
  }
  return this.comment;
});

// Pre-save middleware to set verified status based on booking
reviewSchema.pre('save', async function(next) {
  if (this.isNew && this.booking) {
    try {
      const Booking = mongoose.model('Booking');
      const booking = await Booking.findById(this.booking);
      
      if (booking && booking.status === 'completed' && booking.user.toString() === this.user.toString()) {
        this.isVerified = true;
      }
    } catch (error) {
      console.error('Error verifying review:', error);
    }
  }
  next();
});

// Instance method to check if review can be edited
reviewSchema.methods.canBeEdited = function() {
  const daysSinceCreation = this.reviewAge;
  return daysSinceCreation <= 7; // Allow editing for 7 days
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Instance method to report review
reviewSchema.methods.report = function() {
  this.reportCount += 1;
  if (this.reportCount >= 5) {
    this.isHidden = true; // Auto-hide after 5 reports
  }
  return this.save();
};

// Static method for review analytics
reviewSchema.statics.getReviewStats = async function(tourId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        tour: new mongoose.Types.ObjectId(tourId),
        isHidden: false 
      } 
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: {
          $push: "$rating"
        },
        wouldRecommendCount: {
          $sum: { $cond: ["$wouldRecommend", 1, 0] }
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ["$averageRating", 1] },
        recommendationRate: {
          $round: [
            { $multiply: [{ $divide: ["$wouldRecommendCount", "$totalReviews"] }, 100] },
            1
          ]
        },
        ratingDistribution: {
          1: { $size: { $filter: { input: "$ratingDistribution", cond: { $eq: ["$$this", 1] } } } },
          2: { $size: { $filter: { input: "$ratingDistribution", cond: { $eq: ["$$this", 2] } } } },
          3: { $size: { $filter: { input: "$ratingDistribution", cond: { $eq: ["$$this", 3] } } } },
          4: { $size: { $filter: { input: "$ratingDistribution", cond: { $eq: ["$$this", 4] } } } },
          5: { $size: { $filter: { input: "$ratingDistribution", cond: { $eq: ["$$this", 5] } } } }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    recommendationRate: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

// Static method to find helpful reviews
reviewSchema.statics.findHelpful = function(tourId, limit = 10) {
  return this.find({
    tour: tourId,
    isHidden: false,
    helpfulVotes: { $gte: 1 }
  })
  .populate('user', 'name avatar')
  .sort({ helpfulVotes: -1, createdAt: -1 })
  .limit(limit);
};

// Static method to find recent reviews
reviewSchema.statics.findRecent = function(tourId, limit = 10) {
  return this.find({
    tour: tourId,
    isHidden: false
  })
  .populate('user', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.model("Review", reviewSchema)
