// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import { Review } from "../../../lib/models/Review";
import mongoose from "mongoose";

// GET handler to retrieve reviews for an item
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  const mediaType = url.searchParams.get("mediaType");
  const sort = url.searchParams.get("sort") || "recent";

  if (!itemId || !mediaType) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    await connectDB();

    // Build query
    const query = {
      itemId,
      mediaType,
    };

    // Determine sort order
    let sortOrder = {};
    if (sort === "recent") {
      sortOrder = { createdAt: -1 };
    } else if (sort === "rating") {
      sortOrder = { rating: -1 };
    }

    // Fetch reviews with user info
    const reviews = await Review.find(query)
      .sort(sortOrder)
      .populate("user", "displayName username email avatar")
      .lean();

    // Format reviews for client consumption
    return NextResponse.json(
      reviews.map((review) => ({
        id: review._id.toString(),
        title: review.title,
        content: review.content,
        rating: review.rating,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user._id.toString(),
          displayName: review.user.displayName,
          username: review.user.username,
          email: review.user.email,
          avatar: review.user.avatar,
        },
      }))
    );
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST handler to create a new review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId, mediaType, title, content, rating } = await req.json();

    if (!itemId || !mediaType || !title || !content || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({
      user: session.user.id,
      itemId,
      mediaType,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 400 }
      );
    }

    // Create new review
    const review = new Review({
      user: session.user.id,
      itemId,
      mediaType,
      title,
      content,
      rating,
    });

    await review.save();

    return NextResponse.json(
      { message: "Review created successfully", id: review._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing review
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, content, rating } = await req.json();

    if (!id || !title || !content || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find review and verify ownership
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Update review
    review.title = title;
    review.content = content;
    review.rating = rating;
    review.updatedAt = new Date();

    await review.save();

    return NextResponse.json({ message: "Review updated successfully" });
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}