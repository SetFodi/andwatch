// lib/utils/mediaCache.ts
import { MediaCache } from '../models/MediaCache';
import connectDB from '../db';

// Enhanced cache with better performance
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
    
    // Try to get from cache first with shorter timeout
    const cachePromise = MediaCache.findOne({ externalId, mediaType });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Cache lookup timeout')), 1000)
    );
    
    const cached = await Promise.race([cachePromise, timeoutPromise])
      .catch(() => {
        console.warn(`Cache lookup for ${mediaType}:${externalId} timed out, falling back to fetch`);
        return null;
      });
    
    // If found and not expired, return cached data immediately
    if (cached && (Date.now() - cached.lastUpdated.getTime() < maxAge)) {
      return cached.data;
    }
    
    // Use stale cache if available (regardless of type now - not just for completed)
    if (cached?.data) {
      // Start fetch of fresh data in background without awaiting it
      Promise.resolve().then(async () => {
        try {
          const freshData = await fetchFunction();
          if (freshData && dbConnected) {
            // Update cache in background
            MediaCache.findOneAndUpdate(
              { externalId, mediaType },
              { data: freshData, lastUpdated: Date.now() },
              { upsert: true, new: true }
            ).catch(err => console.warn('Background cache update failed:', err));
          }
        } catch (err) {
          console.warn(`Background refresh for ${mediaType}:${externalId} failed`, err);
        }
      });
      
      // Return stale data immediately
      return cached.data;
    }
    
    // If we get here, we need fresh data
    const freshData = await fetchFunction();
    
    // Update cache in background if we have valid data
    if (freshData && dbConnected) {
      Promise.resolve().then(async () => {
        try {
          await MediaCache.findOneAndUpdate(
            { externalId, mediaType },
            { data: freshData, lastUpdated: Date.now() },
            { upsert: true, new: true }
          );
        } catch (cacheError) {
          console.warn('Cache update failed:', cacheError);
        }
      });
    }
    
    return freshData;
  } catch (error) {
    console.error(`Cache operation error for ${mediaType}:${externalId}:`, error);
    
    // Direct fetch as fallback
    try {
      return await fetchFunction();
    } catch (fetchError) {
      console.error('Direct fetch failed:', fetchError);
      return null;
    }
  }
}

// Process items in batches with improved parallelization
export async function processBatch<T>(
  items: any[],
  processFn: (item: any) => Promise<T | null>,
  batchSize = 5 // Larger batch size for better performance
): Promise<T[]> {
  const results: T[] = [];
  
  if (!items || items.length === 0) {
    return results;
  }
  
  // Create placeholder result array with null values
  // This ensures we maintain the original order and positions
  const resultArray = Array(items.length).fill(null);
  
  // Create batches - processing more items at once
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  // Process all batches in parallel rather than sequentially
  await Promise.all(batches.map(async (batch, batchIndex) => {
    // Process each item in the batch with its original index
    const batchPromises = batch.map((item, i) => {
      const originalIndex = batchIndex * batchSize + i;
      return processFn(item)
        .then(result => {
          // Store result at the original position
          resultArray[originalIndex] = result;
          return result;
        })
        .catch(error => {
          console.error(`Error processing item ${item.externalId}:`, error);
          // Return placeholder object instead of null
          return null;
        });
    });
    
    await Promise.all(batchPromises);
  }));
  
  // Return all results, preserving nulls (they'll be displayed as placeholders)
  return resultArray;
}