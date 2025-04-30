// app/api/user/watchhistory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";

// Get user's watch history
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mediaType = req.nextUrl.searchParams.get("mediaType");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  try {
    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all watchlist items that have updatedAt or completedAt timestamps
    let historyItems = [...user.watchlist].filter(item => 
      item.updatedAt || item.completedAt
    );

    // Filter by media type if specified
    if (mediaType) {
      historyItems = historyItems.filter(item => item.mediaType === mediaType);
    }

    // Sort by most recent activity
    historyItems.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.completedAt || a.addedAt).getTime();
      const dateB = new Date(b.updatedAt || b.completedAt || b.addedAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Apply pagination
    const totalItems = historyItems.length;
    const paginatedItems = historyItems.slice(skip, skip + limit);

    return NextResponse.json({
      history: paginatedItems,
      pagination: {
        total: totalItems,
        page,
        limit,
        pages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
  }
}

// Mark an item as viewed in history (updates timestamp)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { externalId, mediaType, progress } = await req.json();

    if (!externalId || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const now = new Date();

    if (existingItemIndex !== -1) {
      // Update existing item
      user.watchlist[existingItemIndex].updatedAt = now;
      
      // Update progress if provided
      if (progress !== undefined) {
        user.watchlist[existingItemIndex].progress = progress;
      }
      
      // If the item isn't already being watched, set it to watching
      if (!user.watchlist[existingItemIndex].status) {
        user.watchlist[existingItemIndex].status = "watching";
      }
    } else {
      // Add new item to watchlist with watching status
      const newItem = {
        externalId,
        mediaType,
        status: "watching",
        progress: progress || 0,
        addedAt: now,
        updatedAt: now,
        userRating: null
      };
      
      user.watchlist.push(newItem);
    }

    // Save to database
    await user.save();

    // Return the updated item
    const updatedItemIndex = user.watchlist.findIndex(
      (item) => item.externalId === externalId && item.mediaType === mediaType
    );
    
    const updatedItem = updatedItemIndex !== -1 ? user.watchlist[updatedItemIndex] : null;

    return NextResponse.json({ 
      success: true,
      item: updatedItem
    });
  } catch (error) {
    console.error("Error updating watch history:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}
