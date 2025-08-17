import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Historical Site', 'Natural Wonder', 'Religious Site', 'Adventure Spot', 'Cultural Site', 'Archaeological Site', 'National Park', 'Hill Station', 'Lake', 'Valley', 'Fort', 'Palace', 'Museum', 'Shrine', 'Temple', 'Waterfall', 'Mountain', 'Desert', 'Beach', 'City', 'Market', 'Garden', 'Monument', 'Island', 'Park', 'Town', 'Mountain Pass', 'Meadow', 'Picnic Spot', 'Trek', 'Village', 'Viewpoint', 'Natural Beauty', 'Mountain Village', 'Alpine Lake', 'Mountain Peak', 'Landmark']
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Pakistan'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  entryFee: {
    adult: Number,
    child: Number,
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  bestTimeToVisit: [String],
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    }
  },
  facilities: [String],
  nearbyDestinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    days: { type: Number, default: 1 }
  },
  maxGroupSize: {
    type: Number,
    default: 20
  },
  price: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
});

// Update the updatedAt field before saving
destinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
destinationSchema.index({ name: 1 });
destinationSchema.index({ category: 1 });
destinationSchema.index({ 'location.city': 1 });
destinationSchema.index({ 'location.state': 1 });
destinationSchema.index({ 'ratings.average': -1 });
destinationSchema.index({ isActive: 1 });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
