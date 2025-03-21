import mongoose from 'mongoose';

const MediaCacheSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  mediaType: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Create a compound index for faster lookups
MediaCacheSchema.index({ externalId: 1, mediaType: 1 }, { unique: true });

export const MediaCache = mongoose.models.MediaCache || mongoose.model('MediaCache', MediaCacheSchema);
