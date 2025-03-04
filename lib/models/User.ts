// lib/models/User.ts
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the schema for user watch items (anime/movies)
const UserWatchItemSchema = new Schema({
  // External API id (from Jikan or TMDB)
  externalId: {
    type: String,
    required: true
  },
  // Type of media (anime or movie)
  mediaType: {
    type: String,
    enum: ['anime', 'movie'],
    required: true
  },
  // User's personal rating out of 10
  userRating: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  // User's status for this item
  status: {
    type: String,
    enum: ['watching', 'completed', 'on-hold', 'dropped', 'plan_to_watch'],
    default: 'plan_to_watch'
  },
  // Progress tracking (current episode for anime, watched flag for movies)
  progress: {
    type: Number,
    default: 0
  },
  // User notes/review
  notes: {
    type: String,
    default: ''
  },
  // Start date (when the user started watching)
  startDate: {
    type: Date,
    default: null
  },
  // End date (when the user finished watching)
  endDate: {
    type: Date,
    default: null
  },
  // Date added to the user's list
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// User schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    trim: true,
  },
  displayName: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  // User's watchlist
  watchlist: [UserWatchItemSchema],
  // User's favorite anime and movies
  favorites: {
    anime: [{
      externalId: String,
      title: String,
      image: String
    }],
    movies: [{
      externalId: String,
      title: String,
      image: String
    }]
  },
  // User settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    private: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    
    // Set username if not provided
    if (!this.username && this.email) {
      // Create a base username from email
      const baseUsername = this.email.split('@')[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      this.username = `${baseUsername}${randomSuffix}`;
    }
    
    // Set displayName to username if not provided
    if (!this.displayName && this.username) {
      this.displayName = this.username;
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model, reusing it if it already exists
export const User = mongoose.models.User || mongoose.model('User', UserSchema);