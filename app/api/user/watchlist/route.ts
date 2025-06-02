// app/api/user/watchlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";
import { deduplicateWatchlist } from "../../../../lib/utils/deduplicateWatchlist";

// Update user's watchlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { externalId, mediaType, status, progress, notes } = await req.json();

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

    // Handle status update logic
    if (status === null) {
      // If removing status but there's a rating, keep the item but set status to null
      if (existingItemIndex !== -1) {
        if (user.watchlist[existingItemIndex].userRating) {
          user.watchlist[existingItemIndex].status = null;
          user.watchlist[existingItemIndex].updatedAt = new Date();
        } else {
          // If no rating either, remove the item completely
          user.watchlist.splice(existingItemIndex, 1);
        }
      }
    } else {
      // Validate status
      const validStatuses = ["watching", "completed", "plan_to_watch", "on-hold", "dropped"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      if (existingItemIndex !== -1) {
        // Update existing item
        user.watchlist[existingItemIndex].status = status;

        // Don't overwrite existing rating if present
        if (progress !== undefined) {
          user.watchlist[existingItemIndex].progress = progress;
        }

        if (notes) {
          user.watchlist[existingItemIndex].notes = notes;
        }

        user.watchlist[existingItemIndex].updatedAt = new Date();

        // If completing an item, set completedAt date
        if (status === 'completed') {
          user.watchlist[existingItemIndex].completedAt = new Date();
        }
      } else {
        // Add new item to watchlist
        const newItem = {
          externalId,
          mediaType,
          status,
          progress: progress || 0,
          notes: notes || "",
          addedAt: new Date(),
          updatedAt: new Date(),
          userRating: null,
          ...(status === 'completed' ? { completedAt: new Date() } : {})
        };

        user.watchlist.push(newItem);
      }
    }

    // Save to database with proper error handling
    try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user data:", saveError);
      return NextResponse.json({
        error: "Database error: Could not save changes",
        details: saveError.message
      }, { status: 500 });
    }

    // Return the updated item info
    const updatedItemIndex = user.watchlist.findIndex(
      (item) => item.externalId === externalId && item.mediaType === mediaType
    );

    const updatedItem = updatedItemIndex !== -1 ? user.watchlist[updatedItemIndex] : null;

    return NextResponse.json({
      success: true,
      item: updatedItem
    });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json({
      error: "Server error",
      details: error.message || "Unknown error"
    }, { status: 500 });
  }
}

// Get user's watchlist
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mediaType = req.nextUrl.searchParams.get("mediaType");
  const status = req.nextUrl.searchParams.get("status");

  try {
    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Deduplicate the watchlist first to fix the issue with duplicate items
    const deduplicatedWatchlist = deduplicateWatchlist(user.watchlist || []);

    // Filter watchlist based on query parameters
    let filteredWatchlist = [...deduplicatedWatchlist];

    if (mediaType) {
      filteredWatchlist = filteredWatchlist.filter((item) => item.mediaType === mediaType);
    }

    if (status) {
      // Special case for null status (rated but not categorized)
      if (status === "null") {
        filteredWatchlist = filteredWatchlist.filter((item) => item.status === null && item.userRating !== null);
      } else {
        filteredWatchlist = filteredWatchlist.filter((item) => item.status === status);
      }
    }

    return NextResponse.json({
      watchlist: filteredWatchlist,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
  }
}