// lib/models/MediaCache.ts
import mongoose from 'mongoose';

const MediaCacheSchema = new mongoose.Schema({
  externalId: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  mediaType: { 
    type: String, 
    required: true,
    enum: ['anime', 'movie', 'tv'],
    index: true
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  // Add TTL index to automatically remove old entries
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    expires: 0 // Use MongoDB TTL index feature
  }
});

// Create a compound index for faster lookups
MediaCacheSchema.index({ externalId: 1, mediaType: 1 }, { unique: true });

// Add a helper method to check if data is stale
MediaCacheSchema.methods.isStale = function(maxAge = 24 * 60 * 60 * 1000) {
  return Date.now() - this.lastUpdated.getTime() > maxAge;
};

// Only create the model if it doesn't already exist
export const MediaCache = mongoose.models.MediaCache || 
  mongoose.model('MediaCache', MediaCacheSchema);