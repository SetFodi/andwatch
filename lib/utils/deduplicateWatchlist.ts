/**
 * Utility function to deduplicate watchlist items
 * This handles cases where the same item appears multiple times in the watchlist
 */

interface WatchlistItem {
  externalId: string;
  mediaType: string;
  status?: string | null;
  userRating?: number | null;
  progress?: number;
  notes?: string;
  addedAt?: Date;
  updatedAt?: Date;
  completedAt?: Date | null;
  [key: string]: any; // Allow for additional properties
}

/**
 * Deduplicates watchlist items by combining duplicate entries
 * @param watchlist The original watchlist array
 * @returns A new array with duplicates merged
 */
export function deduplicateWatchlist(watchlist: WatchlistItem[]): WatchlistItem[] {
  if (!watchlist || !Array.isArray(watchlist)) {
    return [];
  }
  
  // Create a map to store unique items by their externalId + mediaType
  const uniqueItemsMap = new Map<string, WatchlistItem>();
  
  // Process each item in the watchlist
  for (const item of watchlist) {
    if (!item.externalId || !item.mediaType) continue;
    
    const key = `${item.mediaType}:${item.externalId}`;
    
    if (uniqueItemsMap.has(key)) {
      // If we already have this item, merge the properties
      const existingItem = uniqueItemsMap.get(key)!;
      
      // Keep the most recent status (prefer completed over others)
      if (item.status === 'completed' || !existingItem.status) {
        existingItem.status = item.status;
      }
      
      // Keep the highest rating
      if ((item.userRating || 0) > (existingItem.userRating || 0)) {
        existingItem.userRating = item.userRating;
      }
      
      // Keep the highest progress
      if ((item.progress || 0) > (existingItem.progress || 0)) {
        existingItem.progress = item.progress;
      }
      
      // Combine notes if both have them
      if (item.notes && existingItem.notes) {
        existingItem.notes = `${existingItem.notes}\n${item.notes}`;
      } else if (item.notes) {
        existingItem.notes = item.notes;
      }
      
      // Keep the most recent dates
      if (item.updatedAt && (!existingItem.updatedAt || new Date(item.updatedAt) > new Date(existingItem.updatedAt))) {
        existingItem.updatedAt = item.updatedAt;
      }
      
      if (item.completedAt && (!existingItem.completedAt || new Date(item.completedAt) > new Date(existingItem.completedAt))) {
        existingItem.completedAt = item.completedAt;
      }
      
      // Keep the earliest addedAt date
      if (item.addedAt && (!existingItem.addedAt || new Date(item.addedAt) < new Date(existingItem.addedAt))) {
        existingItem.addedAt = item.addedAt;
      }
    } else {
      // If this is a new item, add it to the map
      uniqueItemsMap.set(key, { ...item });
    }
  }
  
  // Convert the map back to an array
  return Array.from(uniqueItemsMap.values());
}
