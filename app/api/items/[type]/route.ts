import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import { Item } from "../../../../lib/models/Item";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  await connectDB();
  const items = await Item.find({ type: params.type });
  return NextResponse.json(items);
}