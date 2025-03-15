import mongoose, { Schema } from "mongoose";

// Define the Item schema
const ItemSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["anime", "movie", "tv"],
    required: [true, "Type (anime or movie) is required"],
  },
  synopsis: {
    type: String,
    trim: true,
    default: "",
  },
  rating: {
    type: Number,
    min: [0, "Rating cannot be less than 0"],
    max: [10, "Rating cannot exceed 10"],
    default: 0,
  },
  genres: [{
    type: String,
    trim: true,
  }],
  releaseDate: {
    type: Date,
    default: null,
  },
  episodes: {
    type: Number,
    default: null, // For anime; null for movies
  },
  duration: {
    type: Number, // Duration in minutes
    default: null, // For movies; null for anime
  },
  posterUrl: {
    type: String,
    trim: true,
    default: "", // URL to poster image
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

// Middleware to update `updatedAt` on save
ItemSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model, reusing it if it already exists
export const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);