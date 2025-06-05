/**
 * EdAiVi Studio - User Model
 * 
 * This model represents a user in the EdAiVi Studio platform.
 * It includes authentication information, profile details, and preferences.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in query results by default
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [2, 'Display name must be at least 2 characters'],
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'cancelled'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    audioQuality: {
      type: String,
      enum: ['standard', 'high', 'ultra'],
      default: 'high'
    },
    videoQuality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k'],
      default: '1080p'
    }
  },
  usage: {
    storage: {
      audio: {
        type: Number,
        default: 0
      },
      video: {
        type: Number,
        default: 0
      },
      models: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    aiCredits: {
      type: Number,
      default: 100
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },
  social: {
    google: String,
    facebook: String,
    twitter: String,
    github: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification token
UserSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
UserSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  
  return token;
};

// Method to update storage usage
UserSchema.methods.updateStorageUsage = function(type, size) {
  this.usage.storage[type] += size;
  this.usage.storage.total += size;
  return this.save();
};

// Method to update AI credits
UserSchema.methods.updateAiCredits = function(amount) {
  this.usage.aiCredits += amount;
  return this.save();
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Create model from schema
const User = mongoose.model('User', UserSchema);

module.exports = User;
