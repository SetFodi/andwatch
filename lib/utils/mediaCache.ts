// lib/utils/mediaCache.ts
import { MediaCache } from '../models/MediaCache';
import connectDB from '../db';

// Helper function to get or set cache
export async function getOrSetCache(
  externalId: string, 
  mediaType: string, 
  fetchFunction: () => Promise<any>, 
  maxAge = 24 * 60 * 60 * 1000 // 24 hours by default
) {
  await connectDB();
  
  try {
    // Try to get from cache first
    const cached = await MediaCache.findOne({ externalId, mediaType });
    
    // If found and not expired, return cached data
    if (cached && (Date.now() - cached.lastUpdated.getTime() < maxAge)) {
      return cached.data;
    }
    
    // Otherwise fetch fresh data
    const freshData = await fetchFunction();
    
    // Update cache
    if (freshData) {
      await MediaCache.findOneAndUpdate(
        { externalId, mediaType },
        { data: freshData, lastUpdated: Date.now() },
        { upsert: true, new: true }
      );
    }
    
    return freshData;
  } catch (error) {
    console.error('Cache error:', error);
    // Fall back to direct fetch if caching fails
    return fetchFunction();
  }
}

// Process items in batches instead of all at once
export async function processBatch<T>(
  items: any[],
  processFn: (item: any) => Promise<T | null>,
  batchSize = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch with Promise.allSettled instead of Promise.all
    const batchResults = await Promise.allSettled(batch.map(processFn));
    
    // Filter successful results
    const successfulResults = batchResults
      .filter((result): result is PromiseFulfilledResult<T> => 
        result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    results.push(...successfulResults);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
}
