// app/api/user/rating/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";

// Update user's rating for an item
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
 
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
 
  try {
    const { externalId, mediaType, rating, notes = "" } = await req.json();
   
    if (!externalId || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
   
    if (rating !== null && (rating < 1 || rating > 10)) {
      return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
    }
   
    await connectDB();
   
    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
   
    // Find if the item exists in the watchlist
    const existingItemIndex = user.watchlist.findIndex(
      (item) => item.externalId === externalId && item.mediaType === mediaType
    );
   
    // Update or add item
    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItem = user.watchlist[existingItemIndex];
      
      if (rating === null) {
        // Just remove the rating without affecting status
        updatedItem.userRating = null;
        
        // If no status exists, remove the entire item
        if (!updatedItem.status) {
          user.watchlist.splice(existingItemIndex, 1);
        }
      } else {
        updatedItem.userRating = rating;
        
        // Add notes if provided
        if (notes) {
          updatedItem.notes = notes;
        }
      }
      
      // Always update the timestamp
      if (existingItemIndex !== -1 && user.watchlist[existingItemIndex]) {
        user.watchlist[existingItemIndex].updatedAt = new Date();
      }
    } else if (rating !== null) {
      // Add new item with rating but no status
      user.watchlist.push({
        externalId,
        mediaType,
        userRating: rating,
        status: null, // Explicitly set to null to prevent auto-defaults
        notes: notes || "",
        progress: 0,
        addedAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      });
    }
   
    // Save with proper error handling
    try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user data:", saveError);
      return NextResponse.json({ 
        error: "Database error: Could not save changes",
        details: saveError.message
      }, { status: 500 });
    }
   
    // Return the updated item for confirmation
    const updatedIndex = user.watchlist.findIndex(
      (item) => item.externalId === externalId && item.mediaType === mediaType
    );
    
    const updatedItem = updatedIndex !== -1 ? user.watchlist[updatedIndex] : null;
   
    return NextResponse.json({ 
      success: true,
      item: updatedItem
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}

// Get user's rating for a specific item
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
 
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
 
  const externalId = req.nextUrl.searchParams.get('externalId');
  const mediaType = req.nextUrl.searchParams.get('mediaType');
 
  if (!externalId || !mediaType) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }
 
  try {
    await connectDB();
   
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
   
    // Find the item in the user's watchlist
    const item = user.watchlist.find(
      (item) => item.externalId === externalId && item.mediaType === mediaType
    );
   
    if (!item) {
      return NextResponse.json({ rating: null, notes: "", status: null });
    }
   
    return NextResponse.json({
      rating: item.userRating || null,
      notes: item.notes || "",
      status: item.status || null,
      progress: item.progress || 0
    });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}