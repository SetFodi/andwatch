import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";

// Update user's watchlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { externalId, mediaType, status } = await req.json();

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
      (item: any) => item.externalId === externalId && item.mediaType === mediaType
    );

    if (status === null) {
      // Remove from watchlist if status is null
      if (existingItemIndex !== -1) {
        user.watchlist.splice(existingItemIndex, 1);
      }
    } else {
      // Validate status
      const validStatuses = ["watching", "completed", "on-hold", "dropped", "plan_to_watch"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      if (existingItemIndex !== -1) {
        // Update existing item
        user.watchlist[existingItemIndex].status = status;
        user.watchlist[existingItemIndex].updatedAt = new Date();
      } else {
        // Add new item to watchlist
        user.watchlist.push({
          externalId,
          mediaType,
          status,
          addedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    // Filter watchlist based on query parameters
    let filteredWatchlist = [...user.watchlist];

    if (mediaType) {
      filteredWatchlist = filteredWatchlist.filter((item) => item.mediaType === mediaType);
    }

    if (status) {
      filteredWatchlist = filteredWatchlist.filter((item) => item.status === status);
    }

    return NextResponse.json({
      watchlist: filteredWatchlist,
    });
  } catch (error: any) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove item from user's watchlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { externalId, mediaType } = await req.json();

    if (!externalId || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find and remove the item from the watchlist
    const existingItemIndex = user.watchlist.findIndex(
      (item: any) => item.externalId === externalId && item.mediaType === mediaType
    );

    if (existingItemIndex === -1) {
      return NextResponse.json({ error: "Item not found in watchlist" }, { status: 404 });
    }

    user.watchlist.splice(existingItemIndex, 1);
    await user.save();

    return NextResponse.json({ success: true, message: "Item removed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error removing item from watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}