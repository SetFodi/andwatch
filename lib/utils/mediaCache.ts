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
    
    // Try to get from cache first - implement timeout
    const cachePromise = MediaCache.findOne({ externalId, mediaType });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Cache lookup timeout')), 2000)
    );
    
    const cached = await Promise.race([cachePromise, timeoutPromise])
      .catch(() => {
        console.warn(`Cache lookup for ${mediaType}:${externalId} timed out, falling back to fetch`);
        return null;
      });
    
    // If found and not expired, return cached data
    if (cached && (Date.now() - cached.lastUpdated.getTime() < maxAge)) {
      return cached.data;
    }
    
    // Special fallback for completed page - if we have an error fetching
    // but we have some cached data (even if expired), return it as a fallback
    if (cached?.data && mediaType === "completed") {
      try {
        // Try to fetch fresh data with a short timeout
        const freshDataPromise = fetchFunction();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fresh data fetch timeout')), 3000)
        );
        
        const freshData = await Promise.race([freshDataPromise, timeoutPromise]);
        
        // Only update cache if we have valid data
        if (freshData) {
          try {
            // Update cache with a timeout
            const updatePromise = MediaCache.findOneAndUpdate(
              { externalId, mediaType },
              { data: freshData, lastUpdated: Date.now() },
              { upsert: true, new: true, maxTimeMS: 2000 }
            );
            
            await Promise.race([
              updatePromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Cache update timeout')), 2000))
            ]).catch(err => {
              console.warn('Cache update timed out:', err);
            });
          } catch (cacheError) {
            // Log but don't fail if cache update fails
            console.warn('Cache update failed:', cacheError);
          }
          
          return freshData;
        }
      } catch (freshDataError) {
        console.warn(`Fresh data fetch failed for ${mediaType}:${externalId}, using stale cache:`, freshDataError);
        return cached.data; // Fallback to stale data
      }
    }
    
    // Otherwise fetch fresh data with timeout for completed items
    let freshDataPromise = fetchFunction();
    if (mediaType === "completed") {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fresh data fetch timeout')), 5000)
      );
      
      freshDataPromise = Promise.race([freshDataPromise, timeoutPromise]);
    }
    
    // Fetch fresh data
    const freshData = await freshDataPromise;
    
    // Only update cache if we have valid data and connected to DB
    if (freshData && dbConnected) {
      try {
        // Use a short timeout for cache updates
        const updatePromise = MediaCache.findOneAndUpdate(
          { externalId, mediaType },
          { data: freshData, lastUpdated: Date.now() },
          { upsert: true, new: true, maxTimeMS: 2000 }
        );
        
        // Add timeout to cache update
        await Promise.race([
          updatePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Cache update timeout')), 2000))
        ]).catch(err => {
          console.warn('Cache update timed out:', err);
        });
      } catch (cacheError) {
        // Log but don't fail if cache update fails
        console.warn('Cache update failed:', cacheError);
      }
    }
    
    return freshData;
  } catch (error) {
    console.error(`Cache operation error for ${mediaType}:${externalId}:`, error);
    
    // If we couldn't connect to the database at all, or another error occurred,
    // fall back to direct fetch function as a last resort
    if (!dbConnected) {
      try {
        // For completed items, add a short timeout
        if (mediaType === "completed") {
          const fetchPromise = fetchFunction();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Direct fetch timeout')), 5000)
          );
          
          return await Promise.race([fetchPromise, timeoutPromise]);
        }
        
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

// Process items in batches with additional resilience for completed items
export async function processBatch<T>(
  items: any[],
  processFn: (item: any) => Promise<T | null>,
  batchSize = 3 // Reduced batch size to lower load
): Promise<T[]> {
  const results: T[] = [];
  
  if (!items || items.length === 0) {
    return results;
  }
  
  // Track overall batch processing time
  const startTime = Date.now();
  const MAX_TOTAL_TIME = 12000; // 12 seconds maximum for entire batch processing
  
  for (let i = 0; i < items.length; i += batchSize) {
    // Check if we've exceeded our total processing time
    if (Date.now() - startTime > MAX_TOTAL_TIME) {
      console.warn(`Batch processing time limit reached after ${i} items. Returning partial results.`);
      break;
    }
    
    const batch = items.slice(i, i + batchSize);
    
    try {
      // For each item in the batch, create a promise with timeout
      const itemPromises = batch.map(item => {
        const itemPromise = processFn(item);
        const timeoutPromise = new Promise<T | null>((_, reject) => 
          setTimeout(() => reject(new Error(`Item processing timeout for ${item.externalId}`)), 5000)
        );
        
        return Promise.race([itemPromise, timeoutPromise])
          .catch(error => {
            console.error(`Error processing item ${item.externalId}:`, error);
            return null; // Return null on error to keep processing
          });
      });
      
      // Process batch with Promise.allSettled instead of Promise.all
      const batchResults = await Promise.allSettled(itemPromises);
      
      // Filter successful results
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value !== null) {
          results.push(result.value);
        }
      }
      
      // Add a small delay between batches to reduce DB and API load
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      // Continue with next batch rather than failing entire operation
    }
  }
  
  return results;
}