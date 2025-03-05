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
      (item: any) => item.externalId === externalId && item.mediaType === mediaType
    );
    
// In app/api/user/rating/route.ts POST handler:
if (existingItemIndex !== -1) {
  // Update existing item
  if (rating === null) {
    // Just remove the rating without affecting status
    user.watchlist[existingItemIndex].userRating = null;
  } else {
    user.watchlist[existingItemIndex].userRating = rating;
  }
  if (notes) {
    user.watchlist[existingItemIndex].notes = notes;
  }
  user.watchlist[existingItemIndex].updatedAt = new Date();
} else if (rating !== null) {
  // Add new item with rating but no status
  user.watchlist.push({
    externalId,
    mediaType,
    userRating: rating,
    notes,
    addedAt: new Date(),
    updatedAt: new Date()
  });
}
    
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      (item: any) => item.externalId === externalId && item.mediaType === mediaType
    );
    
    if (!item) {
      return NextResponse.json({ rating: null, notes: "" });
    }
    
    return NextResponse.json({
      rating: item.userRating,
      notes: item.notes || "",
      status: item.status
    });
  } catch (error: any) {
    console.error("Error fetching rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}