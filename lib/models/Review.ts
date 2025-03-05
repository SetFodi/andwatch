// lib/models/Review.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ReviewDocument extends Document {
  user: mongoose.Types.ObjectId;
  itemId: string;
  mediaType: "anime" | "movie";
  title: string;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ["anime", "movie"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
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

// Create a compound index to ensure one review per user per item
ReviewSchema.index({ user: 1, itemId: 1, mediaType: 1 }, { unique: true });

// Create model if it doesn't exist yet
export const Review = mongoose.models.Review || mongoose.model<ReviewDocument>("Review", ReviewSchema);