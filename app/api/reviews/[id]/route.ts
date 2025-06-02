// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { Review } from "../../../../lib/models/Review";

// DELETE handler to remove a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewId = params.id;

  if (!reviewId) {
    return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
  }

  try {
    await connectDB();

    // Find review and verify ownership
    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}