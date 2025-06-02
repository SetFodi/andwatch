// lib/models/User.ts
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the WatchItem schema explicitly
const UserWatchItemSchema = new Schema({
  externalId: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ["anime", "movie", "tv"],
    required: true
  },
  userRating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  status: {
    type: String,
    enum: ["watching", "completed", "plan_to_watch", "on-hold", "dropped", null],
    default: null
  },
  progress: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ""
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

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
    default: "", // Will store the file path (e.g., "uploads/avatar_<userId>.jpg")
  },
  bio: {
    type: String,
    default: "",
  },
  watchlist: [UserWatchItemSchema], // Using the defined schema
  favorites: {
    anime: [
      {
        externalId: String,
        title: String,
        image: String,
      },
    ],
    movies: [
      {
        externalId: String,
        title: String,
        image: String,
      },
    ],
  },
  settings: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    private: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash the password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    // Set username if not provided
    if (!this.username && this.email) {
      const baseUsername = this.email.split("@")[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
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

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);