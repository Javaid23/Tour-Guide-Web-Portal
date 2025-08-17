import mongoose from 'mongoose';

const tourGuideSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },

  // Professional Information
  experience: {
    type: String,
    required: true
  },
  languages: [{
    type: String,
    required: true
  }],
  specializations: [{
    type: String,
    required: true
  }],
  preferredRegions: [{
    type: String,
    required: true
  }],
  tourTypes: [{
    type: String
  }],
  certifications: {
    type: String
  },
  previousWork: {
    type: String
  },

  // Availability & Pricing
  availability: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  fullDayRate: {
    type: Number,
    required: true
  },
  multiDayRate: {
    type: Number
  },

  // Documents & Media
  profilePhoto: {
    type: String,
    required: true
  },
  cnicPhoto: {
    type: String,
    required: true
  },
  certificationDocs: [{
    type: String
  }],
  portfolio: [{
    type: String
  }],

  // Social & References
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  references: [{
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    relationship: { type: String, trim: true }
  }],

  // Application Management
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  },
  
  // User Account (if approved)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Rating & Performance (after approval)
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalTours: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },

  // Agreement & Consent
  termsAccepted: {
    type: Boolean,
    required: true
  },
  // dataProcessingConsent removed (no longer required)

  // Additional Fields
  bio: {
    type: String,
    maxlength: 1000
  },
  verificationStatus: {
    documents: { type: Boolean, default: false },
    background: { type: Boolean, default: false },
    references: { type: Boolean, default: false }
  },

  // Link to User account (created when approved)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Active status for approved guides
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for full name
tourGuideSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
tourGuideSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Index for search optimization
tourGuideSchema.index({ email: 1 });
tourGuideSchema.index({ cnic: 1 });
tourGuideSchema.index({ status: 1 });
tourGuideSchema.index({ specializations: 1 });
tourGuideSchema.index({ preferredRegions: 1 });
tourGuideSchema.index({ rating: -1 });
tourGuideSchema.index({ applicationDate: -1 });

// Pre-save middleware
tourGuideSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Clean up CNIC format
  if (this.cnic) {
    this.cnic = this.cnic.replace(/[^0-9]/g, '');
  }
  
  next();
});

// Instance methods
tourGuideSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    specializations: this.specializations,
    preferredRegions: this.preferredRegions,
    languages: this.languages,
    rating: this.rating,
    totalReviews: this.totalReviews,
    totalTours: this.totalTours,
    hourlyRate: this.hourlyRate,
    fullDayRate: this.fullDayRate,
    profilePhoto: this.profilePhoto,
    bio: this.bio,
    isActive: this.isActive
  };
};

tourGuideSchema.methods.updateRating = function(newRating) {
  const totalScore = (this.rating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.rating = totalScore / this.totalReviews;
  return this.save();
};

// Static methods
tourGuideSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ applicationDate: -1 });
};

tourGuideSchema.statics.findAvailableGuides = function(region, specialization) {
  const query = {
    status: 'approved',
    isActive: true
  };
  
  if (region) {
    query.preferredRegions = region;
  }
  
  if (specialization) {
    query.specializations = specialization;
  }
  
  return this.find(query).sort({ rating: -1 });
};

export default mongoose.model('TourGuide', tourGuideSchema);
