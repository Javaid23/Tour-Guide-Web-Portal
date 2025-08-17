import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address"
      ],
      index: true, // Add index for better query performance
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "guide"],
        message: "Role must be either user, admin, or guide"
      },
      default: "user",
      index: true, // Add index for role-based queries
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourGuide',
      default: null,
      index: true // Add index for guide-related queries
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[+]?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      match: [/^\+\d{1,4}$/, "Please enter a valid country code"],
      default: "+1"
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v < new Date();
        },
        message: "Date of birth must be in the past"
      }
    },
    nationality: {
      type: String,
      enum: [
        "american", "canadian", "british", "french", "german", "japanese", 
        "chinese", "indian", "pakistani", "australian", "brazilian", 
        "russian", "korean", "singaporean", "emirati", "saudi", "egyptian", 
        "south african", "mexican", "italian", "spanish", "dutch", 
        "swedish", "norwegian", "swiss", "other"
      ],
      default: "other"
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "Pakistan"
      },
      zipCode: String,
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          // Allow empty values, URLs, or local file paths starting with /
          return !v || /^https?:\/\/.+/.test(v) || /^\//.test(v);
        },
        message: "Avatar must be a valid URL or file path"
      }
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true
      },
      notifications: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        enum: ["en", "ur"],
        default: "en"
      }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
)

// Indexes for better performance
userSchema.index({ email: 1, isActive: 1 })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ createdAt: -1 })

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || '';
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, country } = this.address;
  return [street, city, state, country].filter(Boolean).join(', ');
});

// Pre-save middleware to set name field from firstName and lastName
userSchema.pre("save", function(next) {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// Pre-save middleware to hash password
userSchema.pre("save", async function(next) {
  // Only hash password if it's modified
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    console.error('comparePassword: Missing password data', {
      candidatePassword: !!candidatePassword,
      userPassword: !!this.password
    });
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method for user analytics
userSchema.statics.getUserStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        averageLastLogin: { $avg: "$lastLogin" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default mongoose.model("User", userSchema)
