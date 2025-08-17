import mongoose from "mongoose"

// Optimized Tour Schema with improved structure and indexing
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour name is required"],
      trim: true,
      maxLength: [100, "Tour name cannot exceed 100 characters"],
      index: true, // Index for search performance
    },
    title: {
      type: String,
      required: [true, "Tour title is required"],
      trim: true,
      maxLength: [150, "Tour title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Tour description is required"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
      index: "text", // Full-text search index
    },
    price: {
      type: Number,
      required: [true, "Tour price is required"],
      min: [0, "Price cannot be negative"],
      index: true, // Index for price-based queries
    },
    duration: {
      days: {
        type: Number,
        required: true,
        min: [1, "Duration must be at least 1 day"],
      },
      nights: {
        type: Number,
        default: function() {
          return Math.max(0, this.duration.days - 1);
        }
      }
    },
    destinations: [{
      location: {
        type: String,
        required: true,
        index: true, // Index for location-based queries
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      description: String,
    }],
    category: {
      type: String,
      required: [true, "Tour category is required"],
      enum: {
        values: ["adventure", "cultural", "historical", "nature", "religious", "heritage", "wildlife", "desert", "coastal", "urban"],
        message: "Category must be one of: adventure, cultural, historical, nature, religious, heritage, wildlife, desert, coastal, urban"
      },
      index: true, // Index for category-based filtering
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: "",
      },
      caption: String,
    }],
    highlights: [{
      type: String,
      maxLength: [200, "Highlight cannot exceed 200 characters"],
    }],
    included: [{
      type: String,
      maxLength: [200, "Included item cannot exceed 200 characters"],
    }],
    excluded: [{
      type: String,
      maxLength: [200, "Excluded item cannot exceed 200 characters"],
    }],
    maxGroupSize: {
      type: Number,
      default: 10,
      min: [1, "Group size must be at least 1"],
      max: [50, "Group size cannot exceed 50"],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "moderate", "difficult"],
        message: "Difficulty must be easy, moderate, or difficult"
      },
      default: "moderate",
      index: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot exceed 5"],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, "Rating count cannot be negative"],
      }
    },
    availability: {
      isActive: {
        type: Boolean,
        default: true,
        index: true, // Index for active tour filtering
      },
      seasonalAvailability: [{
        month: {
          type: Number,
          min: 1,
          max: 12,
        },
        available: {
          type: Boolean,
          default: true,
        }
      }]
    },
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    meetingPoint: {
      type: String,
      default: "",
    },
    cancellationPolicy: {
      type: String,
      default: "Free cancellation up to 24 hours before the experience starts.",
    },
    itinerary: [
      {
        day: String,
        title: String,
        description: String,
      }
    ],
    faqs: [
      {
        question: String,
        answer: String,
      }
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      }
    ],
    // Performance optimization: Virtual populate instead of direct references
    reviewCount: {
      type: Number,
      default: 0,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    }
  },
  {
    timestamps: true,
    // Optimize JSON output
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  },
)

// Compound indexes for better query performance
tourSchema.index({ category: 1, price: 1 }); // Category + price queries
tourSchema.index({ "destinations.location": 1, category: 1 }); // Location + category
tourSchema.index({ "availability.isActive": 1, createdAt: -1 }); // Active tours, newest first
tourSchema.index({ "rating.average": -1, "rating.count": -1 }); // Top-rated tours
tourSchema.index({ name: "text", description: "text", "destinations.location": "text" }); // Full-text search

// Virtual for formatted duration
tourSchema.virtual('formattedDuration').get(function() {
  if (this.duration.days === 1) {
    return `${this.duration.days} Day`;
  }
  return `${this.duration.days} Days / ${this.duration.nights} Nights`;
});

// Virtual for main image
tourSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Instance method to update rating
tourSchema.methods.updateRating = function(newRating) {
  const total = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = total / this.rating.count;
  return this.save();
};

// Static method for advanced search
tourSchema.statics.searchTours = function(searchQuery, filters = {}) {
  const query = { "availability.isActive": true };
  
  // Text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.minPrice) query.price = { ...query.price, $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.location) {
    query["destinations.location"] = { $regex: filters.location, $options: "i" };
  }
  
  return this.find(query);
};

// Pre-save middleware for optimization
tourSchema.pre('save', function(next) {
  // Ensure nights calculation
  if (this.duration && this.duration.days) {
    this.duration.nights = Math.max(0, this.duration.days - 1);
  }
  
  // Generate SEO metadata if not provided
  if (!this.seoMetadata.metaTitle && this.name) {
    this.seoMetadata.metaTitle = `${this.name} - Pakistan Tour Guide`;
  }
  
  if (!this.seoMetadata.metaDescription && this.description) {
    this.seoMetadata.metaDescription = this.description.substring(0, 160);
  }
  
  next();
});

// Slug generator utility
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric except -
    .replace(/-+/g, '-')             // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');        // Trim - from start/end
}

tourSchema.pre('validate', async function(next) {
  if (!this.slug && this.name) {
    let baseSlug = slugify(this.name);
    let slug = baseSlug;
    let i = 1;
    // Ensure uniqueness
    while (await mongoose.models.Tour.findOne({ slug })) {
      slug = `${baseSlug}-${i++}`;
    }
    this.slug = slug;
  }
  next();
});

export default mongoose.model("Tour", tourSchema)
