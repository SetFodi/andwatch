// lib/utils/mediaCache.ts
import { MediaCache } from '../models/MediaCache';
import connectDB from '../db';

// Helper function to get or set cache with better error handling
export async function getOrSetCache(
  externalId: string,
  mediaType: string,
  fetchFunction: () => Promise<any>,
  maxAge = 24 * 60 * 60 * 1000 // 24 hours by default
) {
  let dbConnected = false;
  
  try {
    await connectDB();
    dbConnected = true;
    
    // Try to get from cache first
    const cached = await MediaCache.findOne({ externalId, mediaType });
    
    // If found and not expired, return cached data
    if (cached && (Date.now() - cached.lastUpdated.getTime() < maxAge)) {
      return cached.data;
    }
    
    // Otherwise fetch fresh data
    const freshData = await fetchFunction();
    
    // Only update cache if we have valid data
    if (freshData) {
      try {
        await MediaCache.findOneAndUpdate(
          { externalId, mediaType },
          { data: freshData, lastUpdated: Date.now() },
          { upsert: true, new: true, maxTimeMS: 5000 } // Add timeout to avoid long-running operations
        );
      } catch (cacheError) {
        // Log but don't fail if cache update fails
        console.warn('Cache update failed:', cacheError);
        // Still return the fresh data even if caching failed
      }
    }
    
    return freshData;
  } catch (error) {
    console.error(`Cache operation error for ${mediaType}:${externalId}:`, error);
    
    // If we couldn't connect to the database at all, or another error occurred,
    // fall back to direct fetch function as a last resort
    if (!dbConnected) {
      try {
        return await fetchFunction();
      } catch (fetchError) {
        console.error('Direct fetch also failed:', fetchError);
        // Return null or empty data rather than throwing
        return null;
      }
    }
    
    // If we got here, something else failed after DB connection
    return null;
  }
}

// Process items in batches with improved error handling
export async function processBatch<T>(
  items: any[],
  processFn: (item: any) => Promise<T | null>,
  batchSize = 3 // Reduced batch size to lower load
): Promise<T[]> {
  const results: T[] = [];
  
  if (!items || items.length === 0) {
    return results;
  }
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      // Process batch with Promise.allSettled instead of Promise.all
      const batchResults = await Promise.allSettled(batch.map(processFn));
      
      // Filter successful results
      const successfulResults = batchResults
        .filter((result): result is PromiseFulfilledResult<T> =>
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
      
      results.push(...successfulResults);
      
      // Add a small delay between batches to avoid rate limiting and reduce DB load
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      // Continue with next batch rather than failing entire operation
    }
  }
  
  return results;
}